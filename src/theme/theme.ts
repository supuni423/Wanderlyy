import {
  darkColors,
  iconSize,
  lightColors,
  radius,
  spacing,
  TOUCH_TARGET,
  typography,
  type ThemeColors,
} from './tokens';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  iconSize: typeof iconSize;
  touchTarget: number;
}

export function createTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    iconSize,
    touchTarget: TOUCH_TARGET,
  };
}
