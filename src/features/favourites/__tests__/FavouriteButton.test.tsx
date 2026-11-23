import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import type { CountrySummary, RawCountry } from '@/features/countries';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import { FavouriteButton } from '../components/FavouriteButton';
import { selectFavouriteCount, selectIsFavourite } from '../favouritesSlice';

const JAPAN: CountrySummary = {
  code: 'JPN',
  alpha2: 'JP',
  name: 'Japan',
  officialName: 'Japan',
  capital: 'Tokyo',
  region: 'Asia',
  subregion: null,
  population: 1,
  flagUrl: null,
  flagEmoji: '',
};

afterEach(() => jest.restoreAllMocks());

describe('FavouriteButton', () => {
  async function renderButton() {
    const store = makeStore();
    await render(
      <Provider store={store}>
        <ThemeProvider>
          <FavouriteButton country={JAPAN} />
        </ThemeProvider>
      </Provider>,
    );
    return store;
  }

  it('saves and un-saves the country', async () => {
    const store = await renderButton();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Save Japan to favourites' }),
    );
    expect(selectIsFavourite(store.getState(), 'JPN')).toBe(true);

    const saved = screen.getByRole('button', {
      name: 'Remove Japan from favourites',
    });
    expect(saved.props.accessibilityState).toMatchObject({ selected: true });

    await fireEvent.press(saved);
    expect(selectIsFavourite(store.getState(), 'JPN')).toBe(false);
  });

  it('has at least a 48dp touch target', async () => {
    await renderButton();
    const button = screen.getByRole('button');
    const style = [button.props.style].flat(3);
    const minHeight = Math.max(...style.map(s => s?.minHeight ?? 0));
    expect(minHeight).toBeGreaterThanOrEqual(48);
  });
});

describe('favourites in the app', () => {
  const RAW: RawCountry[] = [
    {
      names: { common: 'Japan' },
      codes: { alpha_3: 'JPN' },
      capitals: [{ name: 'Tokyo', primary: true }],
      region: 'Asia',
    },
  ];

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

  it('saving from a card updates the Favourites tab badge', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      // A new Response per request: a body can only be read once.
      async () =>
        new Response(
          JSON.stringify({ data: { objects: RAW, meta: { more: false } } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    );
    const store = makeStore({ auth: SIGNED_IN });
    await render(
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Save Japan to favourites' }),
    );

    expect(selectFavouriteCount(store.getState())).toBe(1);
    expect(await screen.findByLabelText('Favourites, 1 saved')).toBeTruthy();
  });
});
