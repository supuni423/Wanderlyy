import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { makePersistedStore, makeStore } from '@/app/store';
import { sanitizePersistedState } from '@/app/persistence';
import type { AuthState } from '@/features/auth';
import { RootNavigator } from '@/navigation';
import { darkColors, lightColors, useTheme } from '@/theme';
import { AppThemeProvider } from '../AppThemeProvider';
import {
  resolveThemeMode,
  selectThemePreference,
  themePreferenceChanged,
  themeReducer,
} from '../themeSlice';

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

describe('resolveThemeMode', () => {
  it.each([
    ['light', 'dark', 'light'],
    ['dark', 'light', 'dark'],
    ['system', 'dark', 'dark'],
    ['system', 'light', 'light'],
    ['system', null, 'light'],
    ['system', 'unspecified', 'light'],
  ] as const)('%s preference + %s phone -> %s', (pref, phone, expected) => {
    expect(resolveThemeMode(pref, phone)).toBe(expected);
  });
});

describe('themeSlice', () => {
  it('follows the phone by default', () => {
    expect(themeReducer(undefined, { type: 'init' })).toEqual({
      preference: 'system',
    });
  });

  it('stores the chosen preference', () => {
    expect(
      themeReducer(undefined, themePreferenceChanged('dark')).preference,
    ).toBe('dark');
  });
});

describe('AppThemeProvider', () => {
  function ModeProbe() {
    const { mode, colors } = useTheme();
    return <Text testID="probe">{`${mode} ${colors.background}`}</Text>;
  }

  it('provides the chosen theme to the app', async () => {
    const store = makeStore();
    await render(
      <Provider store={store}>
        <AppThemeProvider>
          <ModeProbe />
        </AppThemeProvider>
      </Provider>,
    );
    // Jest's phone setting is light.
    expect(screen.getByTestId('probe').props.children).toBe(
      `light ${lightColors.background}`,
    );

    await waitFor(() => store.dispatch(themePreferenceChanged('dark')));

    expect(screen.getByTestId('probe').props.children).toBe(
      `dark ${darkColors.background}`,
    );
  });
});

describe('Profile appearance setting', () => {
  it('switches the whole app to dark mode', async () => {
    const store = makeStore({ auth: SIGNED_IN });
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));
    await render(
      <Provider store={store}>
        <SafeAreaProvider>
          <AppThemeProvider>
            <RootNavigator />
          </AppThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
    await fireEvent.press(screen.getByText('Profile'));

    const dark = await screen.findByRole('radio', { name: 'Dark theme' });
    expect(dark.props.accessibilityState).toMatchObject({ checked: false });
    await fireEvent.press(dark);

    expect(selectThemePreference(store.getState())).toBe('dark');
    expect(
      screen.getByRole('radio', { name: 'Dark theme' }).props
        .accessibilityState,
    ).toMatchObject({ checked: true });
    // The screen itself is now painted with the dark background.
    const screenStyle = StyleSheet.flatten(
      screen.getByTestId('profile-screen').props.style,
    );
    expect(screenStyle.backgroundColor).toBe(darkColors.background);
  });

  it('has 48dp+ touch targets for every option', async () => {
    const store = makeStore({ auth: SIGNED_IN });
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));
    await render(
      <Provider store={store}>
        <SafeAreaProvider>
          <AppThemeProvider>
            <RootNavigator />
          </AppThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
    await fireEvent.press(screen.getByText('Profile'));

    const radios = await screen.findAllByRole('radio');
    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(
        StyleSheet.flatten(radio.props.style).minHeight,
      ).toBeGreaterThanOrEqual(48);
    }
  });
});

describe('theme persistence', () => {
  beforeEach(() => AsyncStorage.clear());

  it('remembers the choice after a restart', async () => {
    const first = makePersistedStore();
    await waitFor(() =>
      expect(first.persistor.getState().bootstrapped).toBe(true),
    );
    first.store.dispatch(themePreferenceChanged('dark'));
    await first.persistor.flush();

    const second = makePersistedStore();
    await waitFor(() =>
      expect(second.persistor.getState().bootstrapped).toBe(true),
    );
    expect(selectThemePreference(second.store.getState())).toBe('dark');
  });

  it('falls back to "system" if the saved value is unknown', () => {
    const clean = sanitizePersistedState({
      _persist: { version: 1, rehydrated: true },
      theme: { preference: 'purple' },
    } as never);
    expect(clean.theme).toEqual({ preference: 'system' });
  });
});
