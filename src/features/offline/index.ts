/**
 * Offline-first twist: network monitoring, persistent country cache and offline banner.
 */
export {
  clearCountriesCache,
  countriesCacheReducer,
  MAX_CACHED_DETAILS,
  selectCachedCountryDetails,
  selectCachedCountryList,
  selectOfflineStorageSummary,
  selectSavedPageCodes,
  type CachedEntry,
  type CountriesCacheState,
} from './countriesCacheSlice';
export {
  connectionChanged,
  networkReducer,
  selectIsOffline,
  selectNetworkStatus,
  toNetworkStatus,
  type ConnectionInfo,
  type NetworkState,
  type NetworkStatus,
} from './networkSlice';
export { startNetworkMonitor } from './networkMonitor';
export { useNetworkStatus, type NetworkStatusInfo } from './useNetworkStatus';
