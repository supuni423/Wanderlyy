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

  it('shows the intro on first launch and remembers it was seen', async () => {
    await render(<App />);
    await finishSplash();

    expect(screen.getByLabelText('Skip intro')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Skip intro'));

    expect(screen.getByText('Replay intro')).toBeTruthy();
    expect(await hasSeenOnboarding()).toBe(true);
  });

  it('skips the intro when it was already seen', async () => {
    await AsyncStorage.setItem('wanderlyy/onboarding-seen', 'true');
    await render(<App />);
    await finishSplash();

    expect(screen.queryByLabelText('Skip intro')).toBeNull();
    expect(screen.getByText('Replay intro')).toBeTruthy();
  });
});
