import type { ThemeColors } from '@/theme';

export type SlideKey = 'discover' | 'save' | 'offline';

export interface OnboardingSlide {
  key: SlideKey;
  /** Plain part of the title. */
  title: string;
  /** Italic serif word(s) shown on the next line in the accent colour. */
  highlight: string;
  description: string;
  accent: keyof Pick<ThemeColors, 'primary' | 'accentPurple' | 'accentGreen'>;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: 'discover',
    title: 'Discover every corner of',
    highlight: 'the world',
    description:
      'Browse 250 countries with their flags, capitals, languages and currencies, all in one place.',
    accent: 'primary',
  },
  {
    key: 'save',
    title: 'Save the places you',
    highlight: 'dream of',
    description:
      'Tap the heart on any country to build your own travel wishlist. It stays saved on your phone.',
    accent: 'accentPurple',
  },
  {
    key: 'offline',
    title: 'Keep exploring, even',
    highlight: 'offline',
    description:
      'Wanderlyy remembers the countries you have browsed, so you can keep planning without a connection.',
    accent: 'accentGreen',
  },
];
