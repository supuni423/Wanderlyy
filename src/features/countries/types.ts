/**
 * App-side country types. The REST Countries v5 records are large and
 * nested, so they are mapped (countryMapper.ts) into these small, flat
 * shapes before the UI or the offline cache ever sees them.
 */

/** What a Home card / favourite needs. */
export interface CountrySummary {
  /** ISO 3166-1 alpha-3 code, e.g. "JPN" (used as the ID everywhere). */
  code: string;
  /** ISO alpha-2 code, e.g. "JP". */
  alpha2: string;
  name: string;
  officialName: string;
  /** Primary capital, or null (e.g. Antarctica). */
  capital: string | null;
  region: string;
  subregion: string | null;
  population: number;
  flagUrl: string | null;
  flagEmoji: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string | null;
}

/** Everything the Details screen shows. */
export interface CountryDetails extends CountrySummary {
  /** Land area in km², or null when unknown. */
  areaKm2: number | null;
  languages: string[];
  currencies: Currency[];
  timezones: string[];
  /** Alpha-3 codes of neighbouring countries. */
  borders: string[];
  continents: string[];
  landlocked: boolean;
  drivingSide: 'left' | 'right' | null;
  callingCodes: string[];
  tlds: string[];
  /** English demonym, e.g. "Japanese". */
  demonym: string | null;
  coordinates: { lat: number; lng: number } | null;
  flagDescription: string | null;
}

// ---------------------------------------------------------------------------
// Raw v5 shapes (only the parts we read). Every field is optional because
// the data comes from the network and some countries lack some fields.

export interface RawCapital {
  name?: string;
  primary?: boolean;
  attributes?: { primary?: boolean };
}

export interface RawCountry {
  names?: { common?: string; official?: string };
  codes?: { alpha_2?: string; alpha_3?: string };
  capitals?: RawCapital[];
  region?: string;
  subregion?: string;
  population?: number;
  flag?: { emoji?: string; url_png?: string; description?: string };
  area?: { kilometers?: number };
  languages?: { name?: string }[];
  /** Docs call it an object; the samples show an array. Both are handled. */
  currencies?:
    | { code?: string; name?: string; symbol?: string }[]
    | Record<string, { name?: string; symbol?: string }>;
  timezones?: string[];
  borders?: string[];
  continents?: string[];
  landlocked?: boolean;
  cars?: { driving_side?: string };
  calling_codes?: string[];
  tlds?: string[];
  demonyms?: Record<string, { m?: string; f?: string }>;
  coordinates?: { lat?: number; lng?: number };
}

/** Envelope of every v5 response. */
export interface RawListResponse {
  data?: {
    objects?: RawCountry[];
    meta?: { total?: number; count?: number; offset?: number; more?: boolean };
  };
  errors?: { message?: string; code?: string }[];
}
