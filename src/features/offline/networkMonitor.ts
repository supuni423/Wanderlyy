import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { connectionChanged, type NetworkStatus } from './networkSlice';
import { syncAfterReconnect, type SyncState } from './offlineSync';

/**
 * One NetInfo subscription for the whole app. Each change updates the
 * network slice; screens use it to skip requests while offline, and
 * their queries resume by themselves when the connection returns
 * (refreshing only data older than 30 min, see countriesApi).
 *
 * On a real reconnect (offline -> online, not the first reading at
 * start-up) it also downloads pages for favourites saved while offline.
 *
 * Note: RTK Query's `refetchOnReconnect` (via setupListeners) was tried
 * first, but it re-downloads every active query on each reconnect, even
 * data fetched a minute ago. With a monthly request quota, refreshing
 * only stale data is the better trade-off.
 *
 * Returns a function that stops listening.
 */
export function startNetworkMonitor(
  dispatch: ThunkDispatch<SyncState, unknown, UnknownAction>,
): () => void {
  let active = true;
  let last: NetworkStatus = 'unknown';

  const handle = (
    state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
  ) => {
    if (!active) {
      return;
    }
    const action = connectionChanged(state);
    dispatch(action);
    const status = action.payload.status;
    if (status === 'online' && last === 'offline') {
      dispatch(syncAfterReconnect());
    }
    last = status === 'unknown' ? last : status;
  };

  // The listener only fires on changes, so read the current state first.
  NetInfo.fetch()
    .then(handle)
    .catch(() => {
      // Leave the status as "unknown" if NetInfo cannot answer.
    });
  const unsubscribe = NetInfo.addEventListener(handle);

  return () => {
    active = false;
    unsubscribe();
  };
}
