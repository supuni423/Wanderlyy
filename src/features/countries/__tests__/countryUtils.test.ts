import { createTheme } from '@/theme';
import {
  formatArea,
  formatCompact,
  formatList,
  formatNumber,
} from '@/utils/format';
import { getCountriesErrorMessage } from '../countriesErrors';
import { NETWORK_ERROR_MESSAGE } from '@/services/api/errors';
import { pickCapital, toCountrySummary } from '../countryMapper';
import { normalise } from '../filterCountries';
import { regionTone } from '../regionTone';
import { MISSING_KEY_MESSAGE } from '../countriesApi';

/** Small country helpers that the screens rely on. */

describe('regionTone', () => {
  const { colors } = createTheme('light');

  it.each([
    ['Africa', colors.warning],
    ['Americas', colors.primary],
    ['Asia', colors.accentPurple],
    ['Europe', colors.accentGreen],
    ['Oceania', colors.success],
    ['Antarctic', colors.textMuted],
    ['Something new', colors.textMuted],
  ])('%s -> its own colour', (region, expected) => {
    expect(regionTone(region, colors)).toBe(expected);
  });

  it('follows the dark palette too', () => {
    const dark = createTheme('dark').colors;
    expect(regionTone('Asia', dark)).toBe(dark.accentPurple);
  });
});

describe('getCountriesErrorMessage', () => {
  it.each([
    [
      { status: 401, data: {} },
      'The REST Countries API key is missing or invalid.',
    ],
    [
      { status: 403, data: {} },
      'The monthly REST Countries request limit has been reached.',
    ],
    [{ status: 404, data: {} }, 'We could not find that country.'],
    [
      { status: 429, data: {} },
      'Too many requests. Please wait a moment and try again.',
    ],
    [{ status: 500, data: {} }, 'Could not load countries. Please try again.'],
    [{ status: 'FETCH_ERROR', error: 'x' }, NETWORK_ERROR_MESSAGE],
    [{ status: 'TIMEOUT_ERROR', error: 'x' }, NETWORK_ERROR_MESSAGE],
    [
      { status: 'CUSTOM_ERROR', error: MISSING_KEY_MESSAGE },
      MISSING_KEY_MESSAGE,
    ],
  ] as const)('%p', (error, expected) => {
    expect(getCountriesErrorMessage(error as never)).toBe(expected);
  });

  it('returns nothing without an error', () => {
    expect(getCountriesErrorMessage(undefined)).toBeUndefined();
  });

  it('uses the fallback for unexpected (non-HTTP) errors', () => {
    expect(getCountriesErrorMessage({ message: 'boom' })).toBe(
      'Could not load countries. Please try again.',
    );
  });
});

describe('mapper edge cases', () => {
  it('trims whitespace and upper-cases codes', () => {
    expect(
      toCountrySummary({
        names: { common: '  Japan  ' },
        codes: { alpha_3: ' jpn ', alpha_2: 'jp' },
      }),
    ).toMatchObject({ code: 'JPN', alpha2: 'JP', name: 'Japan' });
  });

  it('ignores blank names and negative populations', () => {
    expect(
      toCountrySummary({ names: { common: '   ' }, codes: { alpha_3: 'XXX' } }),
    ).toBeNull();
    expect(
      toCountrySummary({
        names: { common: 'Japan' },
        codes: { alpha_3: 'JPN' },
        population: -5,
      })?.population,
    ).toBe(0);
  });

  it('skips a capital with no name', () => {
    expect(pickCapital([{ name: '' }])).toBeNull();
  });
});

describe('formatter edge cases', () => {
  it('handles negative and fractional values', () => {
    expect(formatCompact(-2_500_000)).toBe('-2.5M');
    expect(formatNumber(0.04)).toBe('0');
    expect(formatArea(0.5)).toBe('0.5 km²');
  });

  it('keeps a single item list unchanged', () => {
    expect(formatList(['Japanese'])).toBe('Japanese');
  });
});

describe('normalise', () => {
  it('handles many accents and case', () => {
    expect(normalise('ÉCUADOR')).toBe('ecuador');
    expect(normalise('São Tomé and Príncipe')).toBe('sao tome and principe');
    expect(normalise('Curaçao')).toBe('curacao');
  });
});
