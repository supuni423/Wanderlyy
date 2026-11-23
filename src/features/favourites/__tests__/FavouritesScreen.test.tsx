import { Alert } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import type { AuthState } from '@/features/auth';
import type { CountrySummary } from '@/features/countries';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/theme';
import { UNDO_TIMEOUT_MS } from '../components/UndoBar';
import { selectFavourites, toggleFavourite } from '../favouritesSlice';

const country = (
  code: string,
  name: string,
  region: string,
): CountrySummary => ({
  code,
  alpha2: '',
  name,
  officialName: name,
  capital: null,
  region,
  subregion: null,
  population: 1000,
  flagUrl: null,
  flagEmoji: '',
});

const JAPAN = country('JPN', 'Japan', 'Asia');
const PERU = country('PER', 'Peru', 'Americas');

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

/** Signed-in app with some favourites, opened on the given tab. */
async function renderWith(saved: CountrySummary[], tab: string) {
  const store = makeStore({ auth: SIGNED_IN });
  const now = jest.spyOn(Date, 'now');
  saved.forEach((c, i) => {
    now.mockReturnValue(1000 + i);
    store.dispatch(toggleFavourite(c));
  });
  now.mockRestore();

  await render(
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
  await fireEvent.press(screen.getByText(tab));
  return store;
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('FavouritesScreen', () => {
  it('lists saved countries newest first, without any network', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    await renderWith([JAPAN, PERU], 'Favourites');

    expect(
      await screen.findByText('2 countries saved · Americas, Asia'),
    ).toBeTruthy();
    const cards = screen
      .getAllByRole('button')
      .map(b => b.props.accessibilityLabel as string | undefined)
      .filter(label => label?.includes('no capital'));
    expect(cards[0]).toMatch(/^Peru/);
    expect(cards[1]).toMatch(/^Japan/);
    // The Favourites tab itself never needs the API.
    const countryCalls = fetchSpy.mock.calls.filter(([req]) =>
      (req as Request).url.includes('/codes.alpha_3/'),
    );
    expect(countryCalls).toHaveLength(0);
  });

  it('removes a country and can undo it', async () => {
    const store = await renderWith([JAPAN, PERU], 'Favourites');

    await fireEvent.press(
      await screen.findByRole('button', {
        name: 'Remove Japan from favourites',
      }),
    );
    expect(screen.getByText('Removed Japan')).toBeTruthy();
    expect(selectFavourites(store.getState()).map(c => c.code)).toEqual([
      'PER',
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));

    // Restored with its original date, so the order is unchanged.
    expect(selectFavourites(store.getState()).map(c => c.code)).toEqual([
      'PER',
      'JPN',
    ]);
    expect(screen.queryByTestId('undo-bar')).toBeNull();
  });

  it('hides the undo bar after a few seconds', async () => {
    await renderWith([JAPAN], 'Favourites');
    jest.useFakeTimers();

    await fireEvent.press(
      await screen.findByRole('button', {
        name: 'Remove Japan from favourites',
      }),
    );
    expect(screen.getByTestId('undo-bar')).toBeTruthy();

    await act(async () => jest.advanceTimersByTime(UNDO_TIMEOUT_MS));
    expect(screen.queryByTestId('undo-bar')).toBeNull();
    expect(screen.getByText('No favourites yet')).toBeTruthy();
  });

  it('shows the empty state when nothing is saved', async () => {
    await renderWith([], 'Favourites');
    expect(await screen.findByText('No favourites yet')).toBeTruthy();
  });
});

describe('ProfileScreen', () => {
  it('shows the user and travel stats', async () => {
    await renderWith([JAPAN, PERU], 'Profile');

    expect(await screen.findByText('Emily Johnson')).toBeTruthy();
    expect(screen.getByLabelText('Saved: 2')).toBeTruthy();
    expect(screen.getByLabelText('Regions: 2')).toBeTruthy();
    expect(screen.getByLabelText('Latest save: Peru')).toBeTruthy();
  });

  it('clears all favourites after confirming', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    const store = await renderWith([JAPAN, PERU], 'Profile');

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Clear all favourites' }),
    );
    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => {
      buttons.find(b => b.text === 'Clear all')?.onPress?.();
    });

    expect(selectFavourites(store.getState())).toEqual([]);
  });

  it('keeps favourites if clearing is cancelled', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    const store = await renderWith([JAPAN], 'Profile');

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Clear all favourites' }),
    );
    const buttons = alert.mock.calls[0][2] ?? [];
    expect(buttons.find(b => b.text === 'Cancel')?.onPress).toBeUndefined();
    expect(selectFavourites(store.getState())).toHaveLength(1);
  });
});
