import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';
import { SPLASH_MIN_MS } from '../EntryFlow';
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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the splash screen first', async () => {
    await render(<App />);
    expect(screen.getByLabelText('Wanderlyy is loading')).toBeTruthy();
  });

  it('shows the intro on first launch, then the login screen', async () => {
    await render(<App />);
    await finishSplash();

    expect(screen.getByLabelText('Skip intro')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Skip intro'));

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(await hasSeenOnboarding()).toBe(true);
  });

  it('goes straight to login when the intro was already seen', async () => {
    await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
    await render(<App />);
    await finishSplash();

    expect(screen.queryByLabelText('Skip intro')).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('switches between login and registration', async () => {
    await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
    await render(<App />);
    await finishSplash();

    await fireEvent.press(screen.getByRole('link'));
    expect(screen.getByRole('button', { name: 'Create account' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('link'));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });
});
