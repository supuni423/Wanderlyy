import type { CountrySummary } from './types';

/** Region chips shown above the list ("All" means no region filter). */
export const REGION_FILTERS = [
  'All',
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'Antarctic',
] as const;

export type RegionFilter = (typeof REGION_FILTERS)[number];

export interface CountryFilters {
  query: string;
  region: RegionFilter;
  /** When given, only countries whose full page is saved offline. */
  onlyCodes?: ReadonlySet<string> | null;
}

/**
 * Lower-case and strip accents, so "aland" matches "Åland" and
 * "cote" matches "Côte d'Ivoire".
 */
export function normalise(text: string): string {
  return (
    text
      .normalize('NFD')
      // Drop the accent marks NFD splits off (\p{M} = any mark).
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim()
  );
}

/**
 * Pure filter used by the Home screen: region first, then a search over
 * name, official name, capital and code. Keeps the incoming (A–Z) order.
 */
export function filterCountries(
  countries: CountrySummary[],
  { query, region, onlyCodes }: CountryFilters,
): CountrySummary[] {
  const needle = normalise(query);
  return countries.filter(country => {
    if (onlyCodes && !onlyCodes.has(country.code)) {
      return false;
    }
    if (region !== 'All' && country.region !== region) {
      return false;
    }
    if (needle === '') {
      return true;
    }
    return [
      country.name,
      country.officialName,
      country.capital ?? '',
      country.code,
    ].some(field => normalise(field).includes(needle));
  });
}
