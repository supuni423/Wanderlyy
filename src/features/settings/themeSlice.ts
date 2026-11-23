import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/theme';

/**
 * Theme preference (bonus: dark mode). Persisted with redux-persist.
 * "system" follows the phone's light/dark setting, live.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeState {
  preference: ThemePreference;
}

const initialState: ThemeState = { preference: 'system' };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themePreferenceChanged(state, action: PayloadAction<ThemePreference>) {
      state.preference = action.payload;
    },
  },
});

export const { themePreferenceChanged } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;

type WithTheme = { theme: ThemeState };
export const selectThemePreference = (state: WithTheme) =>
  state.theme.preference;

/**
 * The theme to actually use. `systemScheme` is what the phone reports
 * (useColorScheme); it can be null/"unspecified", which means light.
 */
export function resolveThemeMode(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): ThemeMode {
  if (preference !== 'system') {
    return preference;
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}
