import type {
  CountryDetails,
  CountrySummary,
  Currency,
  RawCapital,
  RawCountry,
} from './types';

/**
 * Pure functions that turn REST Countries v5 records into app types.
 * They never throw: missing fields become null / [] / sensible defaults,
 * so one odd record cannot break the whole list.
 */

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string' && v !== '')
    : [];

const isPrimary = (capital: RawCapital) =>
  capital.primary === true || capital.attributes?.primary === true;

/** The primary capital, else the first one listed, else null. */
export function pickCapital(capitals: RawCapital[] | undefined): string | null {
  if (!Array.isArray(capitals) || capitals.length === 0) {
    return null;
  }
  const primary = capitals.find(isPrimary) ?? capitals[0];
  return text(primary?.name);
}

/** Returns null for records without a usable code or name (skipped). */
export function toCountrySummary(raw: RawCountry): CountrySummary | null {
  const code = text(raw.codes?.alpha_3)?.toUpperCase();
  const name = text(raw.names?.common);
  if (!code || !name) {
    return null;
  }
  return {
    code,
    alpha2: text(raw.codes?.alpha_2)?.toUpperCase() ?? '',
    name,
    officialName: text(raw.names?.official) ?? name,
    capital: pickCapital(raw.capitals),
    region: text(raw.region) ?? 'Other',
    subregion: text(raw.subregion),
    population:
      typeof raw.population === 'number' && raw.population >= 0
        ? raw.population
        : 0,
    flagUrl: text(raw.flag?.url_png),
    flagEmoji: text(raw.flag?.emoji) ?? '',
  };
}

/** Maps a list, dropping broken records and sorting A–Z by name. */
export function toCountrySummaries(raws: RawCountry[]): CountrySummary[] {
  return raws
    .map(toCountrySummary)
    .filter((c): c is CountrySummary => c !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toCurrencies(raw: RawCountry['currencies']): Currency[] {
  if (Array.isArray(raw)) {
    return raw
      .map(c => ({
        code: text(c?.code) ?? '',
        name: text(c?.name) ?? '',
        symbol: text(c?.symbol),
      }))
      .filter(c => c.name !== '' || c.code !== '');
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([code, c]) => ({
      code,
      name: text(c?.name) ?? code,
      symbol: text(c?.symbol),
    }));
  }
  return [];
}

export function toCountryDetails(raw: RawCountry): CountryDetails | null {
  const summary = toCountrySummary(raw);
  if (!summary) {
    return null;
  }
  const side = raw.cars?.driving_side;
  const lat = raw.coordinates?.lat;
  const lng = raw.coordinates?.lng;
  return {
    ...summary,
    areaKm2:
      typeof raw.area?.kilometers === 'number' ? raw.area.kilometers : null,
    languages: strings(raw.languages?.map(l => l?.name)),
    currencies: toCurrencies(raw.currencies),
    timezones: strings(raw.timezones),
    borders: strings(raw.borders).map(b => b.toUpperCase()),
    continents: strings(raw.continents),
    landlocked: raw.landlocked === true,
    drivingSide: side === 'left' || side === 'right' ? side : null,
    callingCodes: strings(raw.calling_codes),
    tlds: strings(raw.tlds),
    demonym: text(raw.demonyms?.eng?.m) ?? text(raw.demonyms?.eng?.f),
    coordinates:
      typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null,
    flagDescription: text(raw.flag?.description),
  };
}
