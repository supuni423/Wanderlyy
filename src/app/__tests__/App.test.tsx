import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import App from '../App';
import { makeStore } from '../store';
import { SPLASH_MIN_MS } from '../EntryFlow';
import { clearTokens, saveTokens } from '@/features/auth';
import { hasSeenOnboarding } from '@/features/onboarding';

/** Let the splash timer run out and the storage read settle. */
async function finishSplash() {
  await act(async () => {
    jest.advanceTimersByTime(SPLASH_MIN_MS);
  });
}

describe('App entry flow', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
    await clearTokens();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the splash screen first', async () => {
    await render(<App store={makeStore()} />);
    expect(screen.getByLabelText('Wanderlyy is loading')).toBeTruthy();
  });

  it('shows the intro on first launch, then the login screen', async () => {
    await render(<App store={makeStore()} />);
    await finishSplash();

    expect(screen.getByLabelText('Skip intro')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Skip intro'));

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(await hasSeenOnboarding()).toBe(true);
  });

  it('goes straight to login when the intro was already seen', async () => {
    await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
    await render(<App store={makeStore()} />);
    await finishSplash();

    expect(screen.queryByLabelText('Skip intro')).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('switches between login and registration', async () => {
    await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
    await render(<App store={makeStore()} />);
    await finishSplash();

    await fireEvent.press(screen.getByRole('link'));
    expect(screen.getByRole('button', { name: 'Create account' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('link'));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  describe('signing in', () => {
    function mockLoginResponse(status: number, body: object) {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    async function signInWithDemoAccount() {
      await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
      await render(<App store={makeStore()} />);
      await finishSplash();
      await fireEvent.press(screen.getByLabelText('Use demo account'));
      await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    }

    afterEach(() => jest.restoreAllMocks());

    it('shows the signed-in screen after a successful login', async () => {
      mockLoginResponse(200, {
        id: 1,
        username: 'emilys',
        email: 'emily@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        image: 'https://dummyjson.com/icon/emilys/128',
        accessToken: 'a',
        refreshToken: 'r',
      });
      await signInWithDemoAccount();

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy(),
      );
      expect(screen.getByText('Emily')).toBeTruthy();
    });

    it('restores a saved session when the app is reopened', async () => {
      await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
      await saveTokens({ accessToken: 'saved', refreshToken: 'saved-r' });
      mockLoginResponse(200, {
        id: 1,
        username: 'emilys',
        email: 'emily@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        image: 'https://dummyjson.com/icon/emilys/128',
      });

      await render(<App store={makeStore()} />);
      await finishSplash();

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy(),
      );
      expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
    });

    it('shows an error when the password is wrong', async () => {
      mockLoginResponse(400, { message: 'Invalid credentials' });
      await signInWithDemoAccount();

      expect(
        await screen.findByText('Wrong username or password.'),
      ).toBeTruthy();
    });
  });
});
