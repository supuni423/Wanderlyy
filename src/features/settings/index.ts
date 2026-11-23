/**
 * Settings feature: Profile screen and theme preference (dark mode).
 */
export { ProfileScreen } from './screens/ProfileScreen';
export { AppThemeProvider } from './AppThemeProvider';
export { ThemeSelector } from './components/ThemeSelector';
export {
  resolveThemeMode,
  selectThemePreference,
  themePreferenceChanged,
  themeReducer,
  type ThemePreference,
  type ThemeState,
} from './themeSlice';
