import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import { sanitizePersistedState } from '@/app/persistence';
import type { AuthState } from '@/features/auth';
import { countriesApi } from '@/features/countries/countriesApi';
import { toCountryDetails } from '@/features/countries/countryMapper';
import type {
  CountryDetails,
  CountrySummary,
  RawCountry,
} from '@/features/countries/types';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import {
  MAX_CACHED_DETAILS,
  selectCachedCountryDetails,
  selectCachedCountryList,
  type CountriesCacheState,
} from '../countriesCacheSlice';

const raw = (code: string, name: string): RawCountry => ({
  names: { common: name, official: `Official ${name}` },
  codes: { alpha_3: code },
  capitals: [{ name: `${name} City`, primary: true }],
  region: 'Europe',
  population: 1000,
  languages: [{ name: `${name}ish` }],
});

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const page = (objects: RawCountry[]) =>
  json({ data: { objects, meta: { more: false } } });

const offline = () => new TypeError('Network request failed');

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

afterEach(() => jest.restoreAllMocks());

describe('countriesCacheSlice', () => {
  it('saves the country list when it loads', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        page([raw('JPN', 'Japan'), raw('AUT', 'Austria')]),
      );
    const store = makeStore();

    await store.dispatch(countriesApi.endpoints.getCountries.initiate());

    const cached = selectCachedCountryList(store.getState());
    expect(cached?.data.map(c => c.code)).toEqual(['AUT', 'JPN']);
    expect(typeof cached?.savedAt).toBe('number');
  });

  it('does not replace a saved list with an empty answer', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(page([raw('JPN', 'Japan')]))
      .mockResolvedValueOnce(page([]));
    const store = makeStore();

    await store.dispatch(countriesApi.endpoints.getCountries.initiate());
    await store.dispatch(
      countriesApi.endpoints.getCountries.initiate(undefined, {
        forceRefetch: true,
      }),
    );

    expect(
      selectCachedCountryList(store.getState())?.data.map(c => c.code),
    ).toEqual(['JPN']);
  });

  it('saves each country page that is opened', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(page([raw('JPN', 'Japan')]));
    const store = makeStore();

    await store.dispatch(
      countriesApi.endpoints.getCountryByCode.initiate('JPN'),
    );

    expect(
      selectCachedCountryDetails(store.getState(), 'jpn')?.data.languages,
    ).toEqual(['Japanish']);
  });

  it(`keeps at most ${MAX_CACHED_DETAILS} pages, dropping the oldest`, async () => {
    const details: CountriesCacheState['details'] = {};
    for (let i = 0; i < MAX_CACHED_DETAILS; i++) {
      const code = `A${String(i).padStart(2, '0')}`;
      details[code] = {
        data: { code } as CountryDetails,
        savedAt: i, // A00 is the oldest
      };
    }
    const store = makeStore({ countriesCache: { list: null, details } });
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(page([raw('JPN', 'Japan')]));

    await store.dispatch(
      countriesApi.endpoints.getCountryByCode.initiate('JPN'),
    );

    const saved = store.getState().countriesCache.details;
    expect(Object.keys(saved)).toHaveLength(MAX_CACHED_DETAILS);
    expect(saved.A00).toBeUndefined();
    expect(saved.JPN).toBeDefined();
  });
});

describe('offline screens', () => {
  const NOW = Date.now();
  const summary = (code: string, name: string) =>
    toCountryDetails(raw(code, name)) as CountrySummary;

  async function renderOfflineApp(cache: CountriesCacheState) {
    // Every request fails, as if the phone were offline.
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(offline());
    await render(
      <Provider store={makeStore({ auth: SIGNED_IN, countriesCache: cache })}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
  }

  it('shows the saved list on Home when offline', async () => {
    await renderOfflineApp({
      list: {
        data: [summary('AUT', 'Austria'), summary('JPN', 'Japan')],
        savedAt: NOW - 3 * 60 * 60 * 1000,
      },
      details: {},
    });

    expect(
      await screen.findByText('2 countries to explore · saved 3 h ago'),
    ).toBeTruthy();
    expect(screen.getByText('Japan')).toBeTruthy();
    expect(screen.queryByText("Couldn't load countries")).toBeNull();
  });

  it('opens a saved country page fully offline', async () => {
    await renderOfflineApp({
      list: { data: [summary('JPN', 'Japan')], savedAt: NOW },
      details: {
        JPN: {
          data: toCountryDetails(raw('JPN', 'Japan')) as CountryDetails,
          savedAt: NOW - 2 * 60 * 1000,
        },
      },
    });

    await fireEvent.press(await screen.findByText('Japan'));

    expect(await screen.findByText('Saved copy from 2 min ago')).toBeTruthy();
    expect(screen.getByLabelText('Languages: Japanish')).toBeTruthy();
    expect(screen.queryByText("Couldn't load this country")).toBeNull();
  });

  it('still explains when a page was never saved', async () => {
    await renderOfflineApp({
      list: { data: [summary('JPN', 'Japan')], savedAt: NOW },
      details: {},
    });

    await fireEvent.press(await screen.findByText('Japan'));

    expect(await screen.findByText("Couldn't load this country")).toBeTruthy();
    // The name and capital still come from the saved list.
    expect(screen.getByLabelText('Capital: Japan City')).toBeTruthy();
  });
});

describe('sanitizing a saved cache', () => {
  const persisted = { version: 1, rehydrated: true };

  it('drops a damaged cache', () => {
    const clean = sanitizePersistedState({
      _persist: persisted,
      countriesCache: 'broken',
    } as never);
    expect(clean.countriesCache).toEqual({ list: null, details: {} });
  });

  it('keeps valid entries and drops broken ones', () => {
    const japan = { data: { code: 'JPN', name: 'Japan' }, savedAt: 1 };
    const clean = sanitizePersistedState({
      _persist: persisted,
      countriesCache: {
        list: { data: 'not a list', savedAt: 1 },
        details: { JPN: japan, BAD: { data: { code: 'XXX' }, savedAt: 1 } },
      },
    } as never);
    expect(clean.countriesCache).toEqual({
      list: null,
      details: { JPN: japan },
    });
  });
});
