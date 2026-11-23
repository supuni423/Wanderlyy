/**
 * Design tokens: the single source of truth for colours, spacing,
 * typography and sizes. Screens use these instead of raw values.
 */

export const lightColors = {
  background: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F5',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0F766E',
  primaryMuted: '#CCFBF1',
  onPrimary: '#FFFFFF',
  danger: '#DC2626',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  success: '#15803D',
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  background: '#0B1220',
  surface: '#111A2B',
  surfaceMuted: '#1A2536',
  text: '#E2E8F0',
  textMuted: '#94A3B8',
  border: '#243244',
  primary: '#2DD4BF',
  primaryMuted: '#134E4A',
  onPrimary: '#042F2E',
  danger: '#F87171',
  warning: '#FCD34D',
  warningBg: '#3B2F0B',
  success: '#4ADE80',
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

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

/** Minimum touch target in dp (assignment: at least 44pt / 48dp). */
export const TOUCH_TARGET = 48;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;
