import { Alert } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore, type AppStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import { toCountryDetails } from '@/features/countries/countryMapper';
import { filterCountries } from '@/features/countries/filterCountries';
import type {
  CountryDetails,
  CountrySummary,
  RawCountry,
} from '@/features/countries/types';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import type { CountriesCacheState } from '../countriesCacheSlice';
import { connectionChanged } from '../networkSlice';

const raw = (code: string, name: string): RawCountry => ({
  names: { common: name },
  codes: { alpha_3: code },
  capitals: [{ name: `${name} City`, primary: true }],
  region: 'Europe',
  population: 1000,
  languages: [{ name: `${name}ish` }],
});

const details = (code: string, name: string) =>
  toCountryDetails(raw(code, name)) as CountryDetails;
const summary = (code: string, name: string) =>
  details(code, name) as CountrySummary;

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
const page = (objects: RawCountry[]) =>
  json({ data: { objects, meta: { more: false } } });

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

const NOW = Date.now();

/** Japan's page is saved; Peru is only in the list. */
const CACHE: CountriesCacheState = {
  list: {
    data: [summary('JPN', 'Japan'), summary('PER', 'Peru')],
    savedAt: NOW,
  },
  details: { JPN: { data: details('JPN', 'Japan'), savedAt: NOW } },
};

async function renderApp(store: AppStore) {
  await render(
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
}

const goOffline = (store: AppStore) =>
  act(async () => {
    store.dispatch(connectionChanged({ isConnected: false }));
  });
const goOnline = (store: AppStore) =>
  act(async () => {
    store.dispatch(
      connectionChanged({ isConnected: true, isInternetReachable: true }),
    );
  });

afterEach(() => jest.restoreAllMocks());

describe('filterCountries with saved pages', () => {
  it('keeps only countries whose page is saved', () => {
    const list = [summary('JPN', 'Japan'), summary('PER', 'Peru')];
    expect(
      filterCountries(list, {
        query: '',
        region: 'All',
        onlyCodes: new Set(['PER']),
      }).map(c => c.code),
    ).toEqual(['PER']);
  });
});

describe('offline discovery', () => {
  it('marks saved countries and can show only those', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));
    const store = makeStore({ auth: SIGNED_IN, countriesCache: CACHE });
    await renderApp(store);
    await goOffline(store);

    expect(await screen.findByTestId('saved-offline-JPN')).toBeTruthy();
    expect(screen.queryByTestId('saved-offline-PER')).toBeNull();

    await fireEvent.press(
      screen.getByRole('switch', {
        name: 'Only countries saved for offline, 1',
      }),
    );
    expect(await screen.findByText(/^1 of 2 countries/)).toBeTruthy();
    expect(screen.queryByText('Peru')).toBeNull();
  });

  it('does not request the list while offline when a copy is saved', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const store = makeStore({ auth: SIGNED_IN, countriesCache: CACHE });
    await goOffline(store);

    await renderApp(store);

    expect(await screen.findByText('Japan')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('explains an unsaved page offline, then loads it on reconnect', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => page([raw('PER', 'Peru')]));
    const store = makeStore({ auth: SIGNED_IN, countriesCache: CACHE });
    await goOffline(store);
    await renderApp(store);

    await fireEvent.press(await screen.findByText('Peru'));
    expect(await screen.findByText('Not saved for offline yet')).toBeTruthy();
    // Name and capital still come from the saved list.
    expect(screen.getByLabelText('Capital: Peru City')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();

    await goOnline(store);

    expect(await screen.findByLabelText('Languages: Peruish')).toBeTruthy();
    expect(screen.queryByText('Not saved for offline yet')).toBeNull();
  });
});

describe('favourites are kept for offline', () => {
  it('downloads the page when a country is saved online', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => page([raw('PER', 'Peru')]));
    const store = makeStore({ auth: SIGNED_IN, countriesCache: CACHE });
    await goOnline(store);
    await renderApp(store);

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Save Peru to favourites' }),
    );
    await act(async () => {});

    expect(
      fetchSpy.mock.calls.some(([req]) =>
        (req as Request).url.includes('/codes.alpha_3/PER'),
      ),
    ).toBe(true);
    expect(store.getState().countriesCache.details.PER).toBeDefined();
  });

  it('does not try to download while offline', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const store = makeStore({ auth: SIGNED_IN, countriesCache: CACHE });
    await goOffline(store);
    await renderApp(store);

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Save Peru to favourites' }),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('Profile: offline storage', () => {
  it('shows what is saved and can clear it (favourites kept)', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));
    const alert = jest.spyOn(Alert, 'alert');
    const store = makeStore({ auth: SIGNED_IN, countriesCache: CACHE });
    await goOffline(store);
    await renderApp(store);

    await fireEvent.press(screen.getByText('Profile'));
    expect(
      await screen.findByLabelText(
        'Country list: 2 countries · saved just now',
      ),
    ).toBeTruthy();
    expect(
      screen.getByLabelText('Country pages: 1 saved (keeps up to 100)'),
    ).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Clear offline data' }),
    );
    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => {
      buttons.find(b => b.text === 'Clear')?.onPress?.();
    });

    expect(store.getState().countriesCache).toEqual({
      list: null,
      details: {},
    });
    expect(screen.getByLabelText('Country list: Not saved yet')).toBeTruthy();
  });
});
