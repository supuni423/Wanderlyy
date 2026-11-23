import { useAppSelector } from '@/app/hooks';
import { selectNetworkStatus, type NetworkStatus } from './networkSlice';

export interface NetworkStatusInfo {
  status: NetworkStatus;
  isOnline: boolean;
  /** True only when we know we are offline (never while "unknown"). */
  isOffline: boolean;
}

/** Current connection status for components. */
export function useNetworkStatus(): NetworkStatusInfo {
  const status = useAppSelector(selectNetworkStatus);
  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
  };
}
