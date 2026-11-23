import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { Theme } from '@/theme';

/** Maps the app theme onto React Navigation's theme (headers, cards, tabs). */
export function toNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };
}

/** Shared header look for the native stacks inside the tabs. */
export function stackScreenOptions(theme: Theme): NativeStackNavigationOptions {
  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: theme.colors.background },
  };
}
