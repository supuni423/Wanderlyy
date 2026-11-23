import { createAsyncThunk } from '@reduxjs/toolkit';
import { countriesApi } from '@/features/countries/countriesApi';
import {
  selectFavourites,
  type FavouritesState,
} from '@/features/favourites/favouritesSlice';
import type { CountriesCacheState } from './countriesCacheSlice';

/**
 * At most this many pages are downloaded per reconnect. REST Countries
 * allows 20 requests per 10 seconds and the free plan has a monthly
 * quota, so the catch-up is small and runs one request at a time.
 */
export const MAX_PAGES_PER_SYNC = 10;

export type SyncState = {
  favourites: FavouritesState;
  countriesCache: CountriesCacheState;
};

/**
 * Runs when the phone comes back online. Favourites saved while offline
 * could not download their pages then, so fetch the missing ones now
 * (the cache slice stores each one as it arrives).
 */
export const syncAfterReconnect = createAsyncThunk<
  { downloaded: string[] },
  void,
  { state: SyncState }
>('offline/syncAfterReconnect', async (_, { getState, dispatch }) => {
  const state = getState();
  const missing = selectFavourites(state)
    .map(f => f.code)
    .filter(code => !state.countriesCache.details[code])
    .slice(0, MAX_PAGES_PER_SYNC);

  const downloaded: string[] = [];
  for (const code of missing) {
    const result = await dispatch(
      countriesApi.endpoints.getCountryByCode.initiate(code, {
        subscribe: false,
      }),
    );
    if (result.data) {
      downloaded.push(code);
    } else if (result.error) {
      // Connection dropped again or the API refused: try next time.
      break;
    }
  }
  return { downloaded };
});
