import { Platform } from 'react-native';

/**
 * Design tokens: the single source of truth for colours, spacing,
 * typography and sizes. Screens use these instead of raw values.
 *
 * Visual style: a warm "travel scrapbook" look with a cream background,
 * coral / purple / green accents and italic serif highlight words.
 */

export const lightColors = {
  background: '#FBF6EF',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EBE0',
  /** Photo frames, stickers and chips (stays light like real paper). */
  paper: '#FFFFFF',
  text: '#211C17',
  textMuted: '#6E655B',
  border: '#E7DCCD',
  primary: '#D9614C',
  primaryMuted: '#F9DED6',
  onPrimary: '#FFFFFF',
  /** Near-black used for round "next" buttons and active dots. */
  ink: '#211C17',
  onInk: '#FFFFFF',
  accentPurple: '#7E62C0',
  accentGreen: '#4F8F5E',
  accentYellow: '#F2C14E',
  danger: '#B42318',
  warning: '#B45309',
  warningBg: '#FDF0D5',
  success: '#2F7D4A',
  shadow: '#5A4632',
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  background: '#17130F',
  surface: '#221D18',
  surfaceMuted: '#2C261F',
  paper: '#F4EDE4',
  text: '#F4EDE4',
  textMuted: '#B3A898',
  border: '#3A3229',
  primary: '#F08A73',
  primaryMuted: '#4A2A22',
  onPrimary: '#1A0F0B',
  ink: '#F4EDE4',
  onInk: '#17130F',
  accentPurple: '#B49CF0',
  accentGreen: '#86C796',
  accentYellow: '#F5CF6E',
  danger: '#F97066',
  warning: '#FCD34D',
  warningBg: '#3B2F0B',
  success: '#6CCB8A',
  shadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/** Built-in serif font, used for the italic highlight words. */
const serifFamily = Platform.select({ ios: 'Georgia', default: 'serif' });

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  /** Merge onto another style to get an italic serif highlight word. */
  accent: { fontFamily: serifFamily, fontStyle: 'italic', fontWeight: '700' },
} as const;

/** Minimum touch target in dp (assignment: at least 44pt / 48dp). */
export const TOUCH_TARGET = 48;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;
