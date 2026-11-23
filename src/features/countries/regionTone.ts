import type { ThemeColors } from '@/theme';

/** Accent colour per region, so cards are easy to scan at a glance. */
export function regionTone(region: string, colors: ThemeColors): string {
  switch (region) {
    case 'Africa':
      return colors.warning;
    case 'Americas':
      return colors.primary;
    case 'Asia':
      return colors.accentPurple;
    case 'Europe':
      return colors.accentGreen;
    case 'Oceania':
      return colors.success;
    default:
      return colors.textMuted;
  }
}
