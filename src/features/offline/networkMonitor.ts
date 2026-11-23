import NetInfo from '@react-native-community/netinfo';
import type { Dispatch } from '@reduxjs/toolkit';
import { connectionChanged } from './networkSlice';

/**
 * Subscribes to NetInfo and keeps the network slice up to date.
 * Reads the current state once straight away (the listener only fires
 * on changes), then follows every change. Returns an unsubscribe.
 */
export function startNetworkMonitor(dispatch: Dispatch): () => void {
  let active = true;

  NetInfo.fetch()
    .then(state => {
      if (active) {
        dispatch(connectionChanged(state));
      }
    })
    .catch(() => {
      // Leave the status as "unknown" if NetInfo cannot answer.
    });

  const unsubscribe = NetInfo.addEventListener(state => {
    dispatch(connectionChanged(state));
  });

  return () => {
    active = false;
    unsubscribe();
  };
}
