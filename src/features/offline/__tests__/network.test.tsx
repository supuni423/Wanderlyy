import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import { startNetworkMonitor } from '../networkMonitor';
import {
  connectionChanged,
  networkReducer,
  selectNetworkStatus,
  toNetworkStatus,
} from '../networkSlice';

type Listener = (state: {
  isConnected: boolean | null;
  isInternetReachable?: boolean | null;
}) => void;

/** The callback the app registered with NetInfo.addEventListener. */
const lastListener = (): Listener =>
  jest.mocked(NetInfo.addEventListener).mock.calls.at(-1)?.[0] as Listener;

const flush = () => act(async () => {});

describe('toNetworkStatus', () => {
  it.each([
    [{ isConnected: true, isInternetReachable: true }, 'online'],
    // Android reports null until it has checked: treat as online.
    [{ isConnected: true, isInternetReachable: null }, 'online'],
    [{ isConnected: true, isInternetReachable: false }, 'offline'],
    [{ isConnected: false, isInternetReachable: false }, 'offline'],
    [{ isConnected: null, isInternetReachable: null }, 'unknown'],
  ] as const)('%p -> %s', (info, expected) => {
    expect(toNetworkStatus(info)).toBe(expected);
  });
});

describe('networkSlice', () => {
  it('starts as unknown', () => {
    expect(networkReducer(undefined, { type: 'init' })).toEqual({
      status: 'unknown',
      changedAt: null,
    });
  });

  it('only records a new time when the status really changes', () => {
    jest.spyOn(Date, 'now').mockReturnValue(100);
    let state = networkReducer(
      undefined,
      connectionChanged({ isConnected: false }),
    );
    expect(state).toEqual({ status: 'offline', changedAt: 100 });

    jest.spyOn(Date, 'now').mockReturnValue(200);
    state = networkReducer(state, connectionChanged({ isConnected: false }));
    expect(state.changedAt).toBe(100);
    jest.restoreAllMocks();
  });
});

describe('startNetworkMonitor', () => {
  it('reads the current status, then follows changes', async () => {
    const store = makeStore();
    const stop = startNetworkMonitor(store.dispatch);
    await flush();
    expect(selectNetworkStatus(store.getState())).toBe('online');

    lastListener()({ isConnected: false, isInternetReachable: false });
    expect(selectNetworkStatus(store.getState())).toBe('offline');

    lastListener()({ isConnected: true, isInternetReachable: true });
    expect(selectNetworkStatus(store.getState())).toBe('online');
    stop();
  });

  it('unsubscribes from NetInfo when stopped', () => {
    const unsubscribe = jest.fn();
    jest.mocked(NetInfo.addEventListener).mockReturnValueOnce(unsubscribe);

    const stop = startNetworkMonitor(makeStore().dispatch);
    stop();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe('offline banner', () => {
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

  async function renderApp(auth: AuthState) {
    const store = makeStore({ auth });
    await render(
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
    return store;
  }

  it('appears on Home when the connection drops and goes when it returns', async () => {
    const store = await renderApp(SIGNED_IN);
    expect(screen.queryByTestId('offline-banner')).toBeNull();

    await act(async () => {
      store.dispatch(connectionChanged({ isConnected: false }));
    });
    expect(screen.getByTestId('offline-banner')).toBeTruthy();
    expect(screen.getByText("You're offline.")).toBeTruthy();

    await act(async () => {
      store.dispatch(
        connectionChanged({ isConnected: true, isInternetReachable: true }),
      );
    });
    expect(screen.queryByTestId('offline-banner')).toBeNull();
  });

  it('tells signed-out users that signing in needs the internet', async () => {
    const store = await renderApp({ status: 'unauthenticated', user: null });

    await act(async () => {
      store.dispatch(connectionChanged({ isConnected: false }));
    });

    expect(
      screen.getByText('Connect to the internet to continue.'),
    ).toBeTruthy();
  });

  it('is not shown while the status is still unknown', async () => {
    await renderApp(SIGNED_IN);
    expect(screen.queryByTestId('offline-banner')).toBeNull();
  });
});
