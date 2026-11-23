import { filterCountries, normalise } from '../filterCountries';
import type { CountrySummary } from '../types';

const make = (
  code: string,
  name: string,
  region: string,
  capital: string | null,
  officialName = name,
): CountrySummary => ({
  code,
  alpha2: '',
  name,
  officialName,
  capital,
  region,
  subregion: null,
  population: 1,
  flagUrl: null,
  flagEmoji: '',
});

const COUNTRIES = [
  make('ALA', 'Åland Islands', 'Europe', 'Mariehamn'),
  make('CIV', "Côte d'Ivoire", 'Africa', 'Yamoussoukro'),
  make('DEU', 'Germany', 'Europe', 'Berlin', 'Federal Republic of Germany'),
  make('JPN', 'Japan', 'Asia', 'Tokyo'),
  make('NER', 'Niger', 'Africa', 'Niamey'),
  make('PLW', 'Palau', 'Oceania', 'Ngerulmud'),
  make('ATA', 'Antarctica', 'Antarctic', null),
];

const codes = (list: CountrySummary[]) => list.map(c => c.code);

describe('normalise', () => {
  it('lower-cases, trims and removes accents', () => {
    expect(normalise('  Åland ')).toBe('aland');
    expect(normalise("Côte d'Ivoire")).toBe("cote d'ivoire");
  });
});

describe('filterCountries', () => {
  it('returns everything for an empty search and "All"', () => {
    expect(filterCountries(COUNTRIES, { query: '', region: 'All' })).toEqual(
      COUNTRIES,
    );
  });

  it('matches names, capitals and codes, ignoring case', () => {
    expect(codes(filterCountries(COUNTRIES, { query: 'GER', region: 'All' })))
      // Germany (name), Niger (name), Palau (capital "Ngerulmud")
      .toEqual(['DEU', 'NER', 'PLW']);
    expect(
      codes(filterCountries(COUNTRIES, { query: 'tokyo', region: 'All' })),
    ).toEqual(['JPN']);
    expect(
      codes(filterCountries(COUNTRIES, { query: 'jpn', region: 'All' })),
    ).toEqual(['JPN']);
  });

  it('matches the official name', () => {
    expect(
      codes(filterCountries(COUNTRIES, { query: 'federal', region: 'All' })),
    ).toEqual(['DEU']);
  });

  it('ignores accents in both the search and the data', () => {
    expect(
      codes(filterCountries(COUNTRIES, { query: 'aland', region: 'All' })),
    ).toEqual(['ALA']);
    expect(
      codes(filterCountries(COUNTRIES, { query: 'côte', region: 'All' })),
    ).toEqual(['CIV']);
  });

  it('filters by region', () => {
    expect(
      codes(filterCountries(COUNTRIES, { query: '', region: 'Africa' })),
    ).toEqual(['CIV', 'NER']);
  });

  it('combines region and search', () => {
    expect(
      codes(filterCountries(COUNTRIES, { query: 'ger', region: 'Europe' })),
    ).toEqual(['DEU']);
  });

  it('handles countries without a capital', () => {
    expect(
      codes(filterCountries(COUNTRIES, { query: 'ant', region: 'All' })),
    ).toEqual(['ATA']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterCountries(COUNTRIES, { query: 'zzz', region: 'All' })).toEqual(
      [],
    );
  });
});
