import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Current connection status, fed by NetInfo (see networkMonitor.ts).
 * Kept in Redux (not persisted) so any screen, and the automatic
 * refresh on reconnect, can react to it.
 */
export type NetworkStatus = 'unknown' | 'online' | 'offline';

export interface NetworkState {
  status: NetworkStatus;
  /** When the status last changed (ms since epoch), or null. */
  changedAt: number | null;
}

/** The parts of a NetInfo state we use. */
export interface ConnectionInfo {
  isConnected: boolean | null;
  isInternetReachable?: boolean | null;
}

/**
 * Online = connected to a network AND the internet is not known to be
 * unreachable. Android often reports `isInternetReachable: null` at
 * first ("not checked yet"), which counts as online, not offline.
 */
export function toNetworkStatus(info: ConnectionInfo): NetworkStatus {
  if (info.isConnected === null) {
    return 'unknown';
  }
  if (!info.isConnected || info.isInternetReachable === false) {
    return 'offline';
  }
  return 'online';
}

const initialState: NetworkState = { status: 'unknown', changedAt: null };

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    connectionChanged: {
      reducer(
        state,
        action: PayloadAction<{ status: NetworkStatus; at: number }>,
      ) {
        if (action.payload.status !== state.status) {
          state.status = action.payload.status;
          state.changedAt = action.payload.at;
        }
      },
      // Time is added here so the reducer itself stays pure.
      prepare(info: ConnectionInfo) {
        return { payload: { status: toNetworkStatus(info), at: Date.now() } };
      },
    },
  },
});

export const { connectionChanged } = networkSlice.actions;
export const networkReducer = networkSlice.reducer;

type WithNetwork = { network: NetworkState };
export const selectNetworkStatus = (state: WithNetwork) => state.network.status;
export const selectIsOffline = (state: WithNetwork) =>
  state.network.status === 'offline';
