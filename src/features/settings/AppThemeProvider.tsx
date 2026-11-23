import type { PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '@/app/hooks';
import { ThemeProvider } from '@/theme';
import { resolveThemeMode, selectThemePreference } from './themeSlice';

/**
 * Picks light or dark from the saved preference and the phone setting,
 * and provides it to the whole app. Re-renders when either changes.
 */
export function AppThemeProvider({ children }: PropsWithChildren) {
  const preference = useAppSelector(selectThemePreference);
  const systemScheme = useColorScheme();
  const mode = resolveThemeMode(preference, systemScheme);
  return <ThemeProvider mode={mode}>{children}</ThemeProvider>;
}
