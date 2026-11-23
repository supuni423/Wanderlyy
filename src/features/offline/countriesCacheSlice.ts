import { createSelector, createSlice } from '@reduxjs/toolkit';
import { countriesApi } from '@/features/countries/countriesApi';
import type {
  CountryDetails,
  CountrySummary,
} from '@/features/countries/types';

/**
 * Offline copy of the country data (persisted to AsyncStorage).
 *
 * It fills itself: every successful RTK Query response is copied here
 * by the matchers below, so screens just read `liveData ?? cached`.
 * RTK Query's own cache is in memory only; this one survives restarts.
 */

/** Saved details pages are capped so storage stays small. */
export const MAX_CACHED_DETAILS = 100;

export interface CachedEntry<T> {
  data: T;
  /** When the API returned it (ms since epoch). */
  savedAt: number;
}

export interface CountriesCacheState {
  list: CachedEntry<CountrySummary[]> | null;
  details: Record<string, CachedEntry<CountryDetails>>;
}

const initialState: CountriesCacheState = { list: null, details: {} };

const countriesCacheSlice = createSlice({
  name: 'countriesCache',
  initialState,
  reducers: {
    clearCountriesCache: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        countriesApi.endpoints.getCountries.matchFulfilled,
        (state, { payload, meta }) => {
          // An empty answer is never better than a saved full list.
          if (payload.length > 0 || state.list === null) {
            state.list = { data: payload, savedAt: meta.fulfilledTimeStamp };
          }
        },
      )
      .addMatcher(
        countriesApi.endpoints.getCountryByCode.matchFulfilled,
        (state, { payload, meta }) => {
          state.details[payload.code] = {
            data: payload,
            savedAt: meta.fulfilledTimeStamp,
          };
          // Over the cap: forget the least recently fetched pages.
          const codes = Object.keys(state.details);
          if (codes.length > MAX_CACHED_DETAILS) {
            codes
              .sort(
                (a, b) => state.details[a].savedAt - state.details[b].savedAt,
              )
              .slice(0, codes.length - MAX_CACHED_DETAILS)
              .forEach(code => delete state.details[code]);
          }
        },
      );
  },
});

export const { clearCountriesCache } = countriesCacheSlice.actions;
export const countriesCacheReducer = countriesCacheSlice.reducer;

type WithCache = { countriesCache: CountriesCacheState };

export const selectCachedCountryList = (state: WithCache) =>
  state.countriesCache.list;

export const selectCachedCountryDetails = (state: WithCache, code: string) =>
  state.countriesCache.details[code.toUpperCase()] ?? null;

/** Codes of every country whose full page is saved for offline use. */
export const selectSavedPageCodes = createSelector(
  [(state: WithCache) => state.countriesCache.details],
  details => new Set(Object.keys(details)),
);

/** Summary for the Profile "Offline storage" section. */
export const selectOfflineStorageSummary = createSelector(
  [(state: WithCache) => state.countriesCache],
  cache => ({
    countries: cache.list?.data.length ?? 0,
    listSavedAt: cache.list?.savedAt ?? null,
    pages: Object.keys(cache.details).length,
  }),
);
