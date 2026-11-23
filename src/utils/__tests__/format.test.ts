import {
  formatArea,
  formatCallingCodes,
  formatCompact,
  formatList,
  formatNumber,
  formatPopulation,
} from '../format';

describe('formatNumber', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1,000'],
    [125836021, '125,836,021'],
    [2.25, '2.3'],
    [-1500, '-1,500'],
  ])('%p -> %p', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });
});

describe('formatCompact', () => {
  it.each([
    [950, '950'],
    [1500, '1.5K'],
    [33000, '33K'],
    [1234567, '1.2M'],
    [999950, '1M'],
    [1425000000, '1.4B'],
  ])('%p -> %p', (value, expected) => {
    expect(formatCompact(value)).toBe(expected);
  });
});

describe('other formatters', () => {
  it('formats population, showing Unknown for 0', () => {
    expect(formatPopulation(5_000_000)).toBe('5,000,000');
    expect(formatPopulation(0)).toBe('Unknown');
  });

  it('formats area in km²', () => {
    expect(formatArea(377975)).toBe('377,975 km²');
    expect(formatArea(null)).toBe('Unknown');
  });

  it('joins lists with a fallback', () => {
    expect(formatList(['English', 'French'])).toBe('English, French');
    expect(formatList([])).toBe('None');
    expect(formatList([], 'No borders')).toBe('No borders');
  });

  it('prefixes calling codes with +', () => {
    expect(formatCallingCodes(['81'])).toBe('+81');
    expect(formatCallingCodes(['+1', '44'])).toBe('+1, +44');
  });
});
