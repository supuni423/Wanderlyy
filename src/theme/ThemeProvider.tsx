import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { createTheme, type Theme, type ThemeMode } from './theme';

const ThemeContext = createContext<Theme>(createTheme('light'));

interface ThemeProviderProps extends PropsWithChildren {
  /** Light by default. The dark mode toggle (bonus) will drive this from Redux. */
  mode?: ThemeMode;
}

export function ThemeProvider({
  mode = 'light',
  children,
}: ThemeProviderProps) {
  const theme = useMemo(() => createTheme(mode), [mode]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
