import { makeStore } from '@/app/store';
import type { CountrySummary } from '@/features/countries';
import {
  clearFavourites,
  favouritesReducer,
  removeFavourite,
  selectFavouriteCount,
  selectFavourites,
  selectIsFavourite,
  toggleFavourite,
} from '../favouritesSlice';

const country = (code: string, name: string): CountrySummary => ({
  code,
  alpha2: '',
  name,
  officialName: name,
  capital: null,
  region: 'Europe',
  subregion: null,
  population: 1000,
  flagUrl: `https://flags.example/${code}.png`,
  flagEmoji: '',
});

const JAPAN = country('JPN', 'Japan');
const PERU = country('PER', 'Peru');

describe('favouritesSlice', () => {
  afterEach(() => jest.restoreAllMocks());

  it('starts empty', () => {
    const store = makeStore();
    expect(selectFavourites(store.getState())).toEqual([]);
    expect(selectFavouriteCount(store.getState())).toBe(0);
  });

  it('saves the whole country summary with a timestamp', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    const store = makeStore();

    store.dispatch(toggleFavourite(JAPAN));

    expect(selectFavourites(store.getState())).toEqual([
      { ...JAPAN, savedAt: 1_700_000_000_000 },
    ]);
    expect(selectIsFavourite(store.getState(), 'JPN')).toBe(true);
  });

  it('removes a favourite when toggled again', () => {
    const store = makeStore();
    store.dispatch(toggleFavourite(JAPAN));
    store.dispatch(toggleFavourite(JAPAN));

    expect(selectIsFavourite(store.getState(), 'JPN')).toBe(false);
    expect(selectFavouriteCount(store.getState())).toBe(0);
  });

  it('lists the newest favourite first', () => {
    const now = jest.spyOn(Date, 'now');
    const store = makeStore();
    now.mockReturnValue(1000);
    store.dispatch(toggleFavourite(JAPAN));
    now.mockReturnValue(2000);
    store.dispatch(toggleFavourite(PERU));

    expect(selectFavourites(store.getState()).map(c => c.code)).toEqual([
      'PER',
      'JPN',
    ]);
  });

  it('removes one by code and can clear all', () => {
    const store = makeStore();
    store.dispatch(toggleFavourite(JAPAN));
    store.dispatch(toggleFavourite(PERU));

    store.dispatch(removeFavourite('JPN'));
    expect(selectFavourites(store.getState()).map(c => c.code)).toEqual([
      'PER',
    ]);

    store.dispatch(clearFavourites());
    expect(selectFavouriteCount(store.getState())).toBe(0);
  });

  it('keeps the reducer pure (the timestamp comes from the action)', () => {
    const action = toggleFavourite(JAPAN);
    const first = favouritesReducer(undefined, action);
    const second = favouritesReducer(undefined, action);
    expect(first).toEqual(second);
  });
});
