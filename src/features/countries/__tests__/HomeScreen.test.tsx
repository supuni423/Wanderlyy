import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import { CountryCard } from '../components/CountryCard';
import type { CountrySummary, RawCountry } from '../types';

const JAPAN: CountrySummary = {
  code: 'JPN',
  alpha2: 'JP',
  name: 'Japan',
  officialName: 'Japan',
  capital: 'Tokyo',
  region: 'Asia',
  subregion: 'Eastern Asia',
  population: 122430000,
  flagUrl: 'https://flags.restcountries.com/v5/w640/jp.png',
  flagEmoji: '🇯🇵',
};

const RAW: RawCountry[] = [
  {
    names: { common: 'Japan' },
    codes: { alpha_3: 'JPN' },
    capitals: [{ name: 'Tokyo', primary: true }],
    region: 'Asia',
    population: 122430000,
  },
  {
    names: { common: 'Austria' },
    codes: { alpha_3: 'AUT' },
    capitals: [{ name: 'Vienna', primary: true }],
    region: 'Europe',
    population: 9000000,
  },
];

const listResponse = (objects: RawCountry[]) =>
  new Response(JSON.stringify({ data: { objects, meta: { more: false } } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const offline = () => new TypeError('Network request failed');

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

async function renderHome() {
  await render(
    <Provider store={makeStore({ auth: SIGNED_IN })}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
}

afterEach(() => jest.restoreAllMocks());

describe('CountryCard', () => {
  async function renderCard(country: CountrySummary, onPress = jest.fn()) {
    await render(
      <ThemeProvider>
        <CountryCard country={country} onPress={onPress} />
      </ThemeProvider>,
    );
    return onPress;
  }

  it('shows the name, capital, region and short population', async () => {
    await renderCard(JAPAN);
    expect(screen.getByText('Japan')).toBeTruthy();
    expect(screen.getByText('Tokyo')).toBeTruthy();
    expect(screen.getByText('Asia')).toBeTruthy();
    expect(screen.getByText('122.4M')).toBeTruthy();
  });

  it('describes itself for screen readers', async () => {
    await renderCard(JAPAN);
    expect(
      screen.getByLabelText('Japan, capital Tokyo, Asia, population 122.4M'),
    ).toBeTruthy();
  });

  it('passes only the country code when tapped', async () => {
    const onPress = await renderCard(JAPAN);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith('JPN');
  });

  it('copes with no capital, no population and no flag image', async () => {
    await renderCard({
      ...JAPAN,
      name: 'Antarctica',
      capital: null,
      population: 0,
      flagUrl: null,
      flagEmoji: '🇦🇶',
    });
    expect(screen.getByText('No capital')).toBeTruthy();
    expect(screen.getByText('🇦🇶')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });
});

describe('HomeScreen', () => {
  it('shows a loading state, then the countries A-Z', async () => {
    // Hold the response back so the loading state can be seen first.
    let respond: (response: Response) => void = () => {};
    jest.spyOn(globalThis, 'fetch').mockReturnValueOnce(
      new Promise(resolve => {
        respond = resolve;
      }),
    );
    await renderHome();

    expect(screen.getByLabelText('Finding countries…')).toBeTruthy();

    respond(listResponse(RAW));
    expect(await screen.findByText('2 countries to explore')).toBeTruthy();
    const labels = screen
      .getAllByRole('button')
      .map(b => b.props.accessibilityLabel as string | undefined)
      .filter(label => label?.includes('capital'));
    expect(labels[0]).toMatch(/^Austria/);
    expect(labels[1]).toMatch(/^Japan/);
  });

  it('shows an error with a working retry button', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(offline())
      .mockResolvedValueOnce(listResponse(RAW));
    await renderHome();

    expect(await screen.findByText("Couldn't load countries")).toBeTruthy();
    expect(screen.getByText(/Check your internet connection/)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Japan')).toBeTruthy();
  });

  it('shows an empty state when the API returns no countries', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(listResponse([]));
    await renderHome();

    expect(await screen.findByText('No countries yet')).toBeTruthy();
  });

  it('opens the details screen for the tapped country', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(listResponse(RAW));
    await renderHome();

    await fireEvent.press(await screen.findByText('Japan'));
    expect(await screen.findByText('JPN')).toBeTruthy();
  });

  describe('search and region filter', () => {
    it('filters by search text after a short pause', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(listResponse(RAW));
      await renderHome();
      await screen.findByText('Japan');

      await fireEvent.changeText(
        screen.getByLabelText('Search countries'),
        'vienna',
      );

      expect(await screen.findByText('1 of 2 countries')).toBeTruthy();
      expect(screen.getByText('Austria')).toBeTruthy();
      expect(screen.queryByText('Japan')).toBeNull();
    });

    it('filters by region chip', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(listResponse(RAW));
      await renderHome();
      await screen.findByText('Japan');

      await fireEvent.press(screen.getByRole('tab', { name: 'Asia' }));

      expect(await screen.findByText('1 of 2 countries')).toBeTruthy();
      expect(screen.getByText('Japan')).toBeTruthy();
      expect(screen.queryByText('Austria')).toBeNull();
      expect(
        screen.getByRole('tab', { name: 'Asia' }).props.accessibilityState,
      ).toMatchObject({ selected: true });
    });

    it('shows "No matches" and can clear the filters', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(listResponse(RAW));
      await renderHome();
      await screen.findByText('Japan');

      await fireEvent.changeText(
        screen.getByLabelText('Search countries'),
        'atlantis',
      );
      expect(await screen.findByText('No matches')).toBeTruthy();
      expect(screen.getByText('Nothing matches "atlantis".')).toBeTruthy();

      await fireEvent.press(
        screen.getByRole('button', { name: 'Clear filters' }),
      );
      expect(await screen.findByText('2 countries to explore')).toBeTruthy();
      expect(screen.getByLabelText('Search countries').props.value).toBe('');
    });
  });
});
