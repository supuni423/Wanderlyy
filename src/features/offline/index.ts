/**
 * Offline-first twist: network monitoring, persistent country cache and offline banner.
 */
export {
  clearCountriesCache,
  countriesCacheReducer,
  MAX_CACHED_DETAILS,
  selectCachedCountryDetails,
  selectCachedCountryList,
  type CachedEntry,
  type CountriesCacheState,
} from './countriesCacheSlice';
