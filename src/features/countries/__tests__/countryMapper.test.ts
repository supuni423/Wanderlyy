import {
  pickCapital,
  toCountryDetails,
  toCountrySummaries,
  toCountrySummary,
} from '../countryMapper';
import type { RawCountry } from '../types';

/** Trimmed REST Countries v5 record (shape from the v5 docs sample). */
const CANADA: RawCountry = {
  names: { common: 'Canada', official: 'Canada' },
  codes: { alpha_2: 'CA', alpha_3: 'CAN' },
  capitals: [{ name: 'Ottawa', attributes: { primary: true } }],
  region: 'Americas',
  subregion: 'North America',
  population: 38005238,
  flag: {
    emoji: '🇨🇦',
    url_png: 'https://flags.restcountries.com/v5/w640/ca.png',
    description: 'A red maple leaf on a white square.',
  },
  area: { kilometers: 9984670 },
  languages: [{ name: 'English' }, { name: 'French' }],
  currencies: [{ code: 'CAD', name: 'Canadian dollar', symbol: '$' }],
  timezones: ['UTC-08:00', 'UTC-03:30'],
  borders: ['usa'],
  continents: ['North America'],
  landlocked: false,
  cars: { driving_side: 'right' },
  calling_codes: ['1'],
  tlds: ['.ca'],
  demonyms: { eng: { m: 'Canadian', f: 'Canadian' } },
  coordinates: { lat: 60, lng: -95 },
};

describe('toCountrySummary', () => {
  it('maps a full record to the card shape', () => {
    expect(toCountrySummary(CANADA)).toEqual({
      code: 'CAN',
      alpha2: 'CA',
      name: 'Canada',
      officialName: 'Canada',
      capital: 'Ottawa',
      region: 'Americas',
      subregion: 'North America',
      population: 38005238,
      flagUrl: 'https://flags.restcountries.com/v5/w640/ca.png',
      flagEmoji: '🇨🇦',
    });
  });

  it('skips records without a code or a name', () => {
    expect(toCountrySummary({ names: { common: 'Nowhere' } })).toBeNull();
    expect(toCountrySummary({ codes: { alpha_3: 'NOW' } })).toBeNull();
  });

  it('fills sensible defaults for missing fields', () => {
    const summary = toCountrySummary({
      names: { common: 'Antarctica' },
      codes: { alpha_3: 'ata' },
    });
    expect(summary).toMatchObject({
      code: 'ATA',
      officialName: 'Antarctica',
      capital: null,
      region: 'Other',
      subregion: null,
      population: 0,
      flagUrl: null,
      flagEmoji: '',
    });
  });
});

describe('pickCapital', () => {
  it('prefers the primary capital', () => {
    expect(
      pickCapital([
        { name: 'Pretoria', attributes: { executive: true } as never },
        { name: 'Cape Town' },
        { name: 'Tshwane', primary: true },
      ]),
    ).toBe('Tshwane');
  });

  it('falls back to the first capital, or null', () => {
    expect(pickCapital([{ name: 'Bern' }, { name: 'Zurich' }])).toBe('Bern');
    expect(pickCapital([])).toBeNull();
    expect(pickCapital(undefined)).toBeNull();
  });
});

describe('toCountrySummaries', () => {
  it('drops broken records and sorts by name', () => {
    const list = toCountrySummaries([
      { names: { common: 'Japan' }, codes: { alpha_3: 'JPN' } },
      { names: { common: 'broken' } },
      { names: { common: 'Austria' }, codes: { alpha_3: 'AUT' } },
    ]);
    expect(list.map(c => c.code)).toEqual(['AUT', 'JPN']);
  });
});

describe('toCountryDetails', () => {
  it('maps the details fields', () => {
    expect(toCountryDetails(CANADA)).toMatchObject({
      code: 'CAN',
      areaKm2: 9984670,
      languages: ['English', 'French'],
      currencies: [{ code: 'CAD', name: 'Canadian dollar', symbol: '$' }],
      borders: ['USA'],
      landlocked: false,
      drivingSide: 'right',
      callingCodes: ['1'],
      tlds: ['.ca'],
      demonym: 'Canadian',
      coordinates: { lat: 60, lng: -95 },
      flagDescription: 'A red maple leaf on a white square.',
    });
  });

  it('also reads currencies given as an object keyed by code', () => {
    const details = toCountryDetails({
      ...CANADA,
      currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } },
    });
    expect(details?.currencies).toEqual([
      { code: 'JPY', name: 'Japanese yen', symbol: '¥' },
    ]);
  });

  it('copes with a record that has only the basics', () => {
    const details = toCountryDetails({
      names: { common: 'Bouvet Island' },
      codes: { alpha_3: 'BVT' },
    });
    expect(details).toMatchObject({
      areaKm2: null,
      languages: [],
      currencies: [],
      borders: [],
      drivingSide: null,
      demonym: null,
      coordinates: null,
    });
  });
});

describe('real REST Countries v5 record (Japan, saved from the live API)', () => {
  const japan = require('./fixtures/japan.v5.json').data
    .objects[0] as RawCountry;

  it('maps to the details the app shows', () => {
    expect(toCountryDetails(japan)).toEqual({
      code: 'JPN',
      alpha2: 'JP',
      name: 'Japan',
      officialName: 'Japan',
      capital: 'Tokyo',
      region: 'Asia',
      subregion: 'Eastern Asia',
      population: 122430000,
      flagUrl: 'https://flags.restcountries.com/v5/w640/jp.png',
      flagEmoji: '🇯🇵',
      areaKm2: 377930,
      languages: ['Japanese'],
      currencies: [{ code: 'JPY', name: 'Japanese yen', symbol: '¥' }],
      timezones: ['UTC+09:00'],
      borders: [],
      continents: ['Asia'],
      landlocked: false,
      drivingSide: 'left',
      callingCodes: ['81'],
      tlds: ['.jp', '.みんな'],
      demonym: 'Japanese',
      coordinates: { lat: 36, lng: 138 },
      flagDescription:
        'The flag of Japan features a crimson-red circle at the center of a white field.',
    });
  });
});
