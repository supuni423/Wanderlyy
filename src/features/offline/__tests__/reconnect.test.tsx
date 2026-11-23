import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, render, screen } from '@testing-library/react-native';
import { makeStore, type AppStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import { toCountryDetails } from '@/features/countries/countryMapper';
import type {
  CountryDetails,
  CountrySummary,
  RawCountry,
} from '@/features/countries/types';
import { toggleFavourite } from '@/features/favourites/favouritesSlice';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import { startNetworkMonitor } from '../networkMonitor';
import { RECONNECT_TOAST_MS, ReconnectToast } from '../ReconnectToast';
import { MAX_PAGES_PER_SYNC, syncAfterReconnect } from '../offlineSync';

type Listener = (state: {
  isConnected: boolean | null;
  isInternetReachable?: boolean | null;
}) => void;
const listener = (): Listener =>
  jest.mocked(NetInfo.addEventListener).mock.calls.at(-1)?.[0] as Listener;

const raw = (code: string, name: string): RawCountry => ({
  names: { common: name },
  codes: { alpha_3: code },
  region: 'Europe',
});
const summary = (code: string, name: string) =>
  toCountryDetails(raw(code, name)) as CountrySummary;
const page = (objects: RawCountry[]) =>
  new Response(JSON.stringify({ data: { objects, meta: { more: false } } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const SIGNED_IN: AuthState = {
  status: 'authenticated',
  user: {
    id: 1,
    username: 'emilys',
    email: 'e@example.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    image: '',
  },
};

const offline = () =>
  act(async () =>
    listener()({ isConnected: false, isInternetReachable: false }),
  );
const online = () =>
  act(async () => listener()({ isConnected: true, isInternetReachable: true }));

/** Store + NetInfo monitor, and a log of every dispatched action type. */
function startApp(store: AppStore) {
  const types: string[] = [];
  const dispatch = ((action: unknown) => {
    if (typeof action === 'function') {
      types.push('thunk');
    } else if (action && typeof action === 'object' && 'type' in action) {
      types.push(String((action as { type: unknown }).type));
    }
    return store.dispatch(action as never);
  }) as AppStore['dispatch'];
  const stop = startNetworkMonitor(dispatch);
  return { types, stop };
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('network monitor', () => {
  it('syncs only on a real reconnect, not at start-up', async () => {
    const store = makeStore();
    const { types, stop } = startApp(store);
    await act(async () => {});

    // First reading (unknown -> online) is not a "reconnect".
    expect(types).not.toContain('thunk');

    await offline();
    expect(types).not.toContain('thunk');
    await online();
    // The only thunk the monitor dispatches is syncAfterReconnect.
    expect(types.filter(t => t === 'thunk')).toHaveLength(1);
    stop();
  });

  it('downloads pages for favourites saved while offline', async () => {
    const store = makeStore();
    store.dispatch(toggleFavourite(summary('PER', 'Peru')));
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => page([raw('PER', 'Peru')]));
    const { stop } = startApp(store);
    await act(async () => {});
    await offline();

    await online();
    await act(async () => {});

    expect(
      fetchSpy.mock.calls.filter(([req]) =>
        (req as Request).url.includes('/codes.alpha_3/PER'),
      ),
    ).toHaveLength(1);
    expect(store.getState().countriesCache.details.PER).toBeDefined();
    stop();
  });
});

describe('syncAfterReconnect', () => {
  it(`downloads at most ${MAX_PAGES_PER_SYNC} missing pages, skipping saved ones`, async () => {
    const store = makeStore();
    for (let i = 0; i < MAX_PAGES_PER_SYNC + 3; i++) {
      // Valid ISO-style codes are three letters: AAA, AAB, AAC, ...
      const code = `AA${String.fromCharCode(65 + i)}`;
      store.dispatch(toggleFavourite(summary(code, code)));
    }
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async input => {
        const code =
          (input as Request).url.split('/').pop()?.split('?')[0] ?? '';
        return page([raw(code, code)]);
      });

    const result = await store.dispatch(syncAfterReconnect());

    expect(fetchSpy).toHaveBeenCalledTimes(MAX_PAGES_PER_SYNC);
    expect(result.payload).toEqual({
      downloaded: expect.arrayContaining([expect.any(String)]),
    });
  });

  it('stops at the first failure and tries again next time', async () => {
    const store = makeStore();
    store.dispatch(toggleFavourite(summary('AAA', 'A')));
    store.dispatch(toggleFavourite(summary('BBB', 'B')));
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new TypeError('offline again'));

    await store.dispatch(syncAfterReconnect());

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().countriesCache.details).toEqual({});
  });

  it('does nothing when every favourite is already saved', async () => {
    const store = makeStore({
      countriesCache: {
        list: null,
        details: {
          PER: {
            data: toCountryDetails(raw('PER', 'Peru')) as CountryDetails,
            savedAt: 1,
          },
        },
      },
    });
    store.dispatch(toggleFavourite(summary('PER', 'Peru')));
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    await store.dispatch(syncAfterReconnect());

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('refresh on reconnect (request budget)', () => {
  it('refreshes the list on reconnect only when it is stale', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => page([raw('JPN', 'Japan')]));
    const store = makeStore({ auth: SIGNED_IN });
    const { stop } = startApp(store);
    await act(async () => {});
    await render(
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
    await screen.findByText('Japan');
    const listCalls = () =>
      fetchSpy.mock.calls.filter(
        ([req]) => !(req as Request).url.includes('/codes.alpha_3/'),
      ).length;
    expect(listCalls()).toBe(1);

    await offline();
    await online();
    await act(async () => {});

    // Fresh data (well under 30 min old) is not downloaded again.
    expect(listCalls()).toBe(1);

    // 31 minutes later the list is stale: the next reconnect refreshes it.
    // (RTK reads the clock with `new Date()`, so move the system clock.)
    jest.useFakeTimers({
      doNotFake: [
        'setTimeout',
        'clearTimeout',
        'setImmediate',
        'queueMicrotask',
        'nextTick',
      ],
    });
    jest.setSystemTime(Date.now() + 31 * 60 * 1000);
    await offline();
    await online();
    await act(async () => {});
    expect(listCalls()).toBe(2);
    stop();
  });
});

describe('ReconnectToast', () => {
  it('shows only after a real reconnect, then hides by itself', async () => {
    const store = makeStore();
    const { stop } = startApp(store);
    await act(async () => {});
    await render(
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ReconnectToast />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
    // Start-up (unknown -> online) does not count as coming back.
    expect(screen.queryByTestId('reconnect-toast')).toBeNull();

    await offline();
    expect(screen.queryByTestId('reconnect-toast')).toBeNull();

    jest.useFakeTimers();
    await online();
    expect(
      screen.getByText('Back online · refreshing your countries'),
    ).toBeTruthy();

    await act(async () => jest.advanceTimersByTime(RECONNECT_TOAST_MS));
    expect(screen.queryByTestId('reconnect-toast')).toBeNull();
    stop();
  });
});
