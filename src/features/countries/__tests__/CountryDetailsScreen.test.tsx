import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import type { RawCountry } from '../types';

const GERMANY: RawCountry = {
  names: { common: 'Germany', official: 'Federal Republic of Germany' },
  codes: { alpha_2: 'DE', alpha_3: 'DEU' },
  capitals: [{ name: 'Berlin', primary: true }],
  region: 'Europe',
  subregion: 'Western Europe',
  population: 83298787,
  area: { kilometers: 357114 },
  languages: [{ name: 'German' }],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  timezones: ['UTC+01:00'],
  borders: ['AUT'],
  continents: ['Europe'],
  landlocked: false,
  cars: { driving_side: 'right' },
  calling_codes: ['49'],
  tlds: ['.de'],
  demonyms: { eng: { m: 'German' } },
  flag: { description: 'Three bands of black, red and gold.' },
};

const AUSTRIA: RawCountry = {
  names: { common: 'Austria', official: 'Republic of Austria' },
  codes: { alpha_3: 'AUT' },
  capitals: [{ name: 'Vienna', primary: true }],
  region: 'Europe',
  population: 9200000,
  borders: ['DEU'],
  landlocked: true,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const page = (objects: RawCountry[]) =>
  json({ data: { objects, meta: { more: false } } });

/**
 * Fake REST Countries: answers by URL. `failDetailsOnce` makes the first
 * details request fail as if offline.
 */
function mockApi({ failDetailsOnce = false } = {}) {
  let failed = !failDetailsOnce;
  return jest.spyOn(globalThis, 'fetch').mockImplementation(async input => {
    const url = (input as Request).url;
    const code = url.match(/codes\.alpha_3\/([A-Z]+)/)?.[1];
    if (!code) {
      return page([GERMANY, AUSTRIA]);
    }
    if (!failed) {
      failed = true;
      throw new TypeError('Network request failed');
    }
    if (code === 'DEU') {
      return page([GERMANY]);
    }
    if (code === 'AUT') {
      return page([AUSTRIA]);
    }
    return page([]);
  });
}

const SIGNED_IN: AuthState = {
  status: 'authenticated',
  user: {
    id: 1,
    username: 'emilys',
    email: 'emily@example.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    image: '',
  },
};

async function openFromHome(name: string) {
  await render(
    <Provider store={makeStore({ auth: SIGNED_IN })}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
  await fireEvent.press(await screen.findByText(name));
}

afterEach(() => jest.restoreAllMocks());

describe('CountryDetailsScreen', () => {
  it('loads the details by code and shows the facts', async () => {
    const spy = mockApi();
    await openFromHome('Germany');

    expect(await screen.findByText('Euro (€)')).toBeTruthy();
    expect(screen.getByText('Federal Republic of Germany')).toBeTruthy();
    expect(screen.getByLabelText('Languages: German')).toBeTruthy();
    expect(screen.getByLabelText('Calling code: +49')).toBeTruthy();
    expect(screen.getByLabelText('Driving: On the right')).toBeTruthy();
    expect(screen.getByLabelText('Area: 357,114 km²')).toBeTruthy();
    expect(
      screen.getByText('Three bands of black, red and gold.'),
    ).toBeTruthy();

    const detailsCall = spy.mock.calls.find(([req]) =>
      (req as Request).url.includes('/codes.alpha_3/DEU'),
    );
    expect(detailsCall).toBeTruthy();
  });

  it('shows the name straight away from the list while details load', async () => {
    mockApi();
    await openFromHome('Germany');

    // Rendered from the cached list before the details request finishes.
    expect(screen.getAllByText('Germany').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Capital: Berlin')).toBeTruthy();
  });

  it('opens a neighbouring country by tapping its chip', async () => {
    mockApi();
    await openFromHome('Germany');

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Open Austria' }),
    );

    expect(await screen.findByText('Republic of Austria')).toBeTruthy();
    expect(await screen.findByLabelText('Coastline: Landlocked')).toBeTruthy();
  });

  it('shows an error with retry when the details fail to load', async () => {
    mockApi({ failDetailsOnce: true });
    await openFromHome('Germany');

    expect(await screen.findByText("Couldn't load this country")).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Euro (€)')).toBeTruthy();
  });
});
