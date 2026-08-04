import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Teaches React Query what "online" actually means on a phone. Without this it
 * assumes it is always online and burns its retries against a dead connection,
 * surfacing a generic failure instead of "you're offline".
 */
export function startNetworkWatcher() {
  return onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected && state.isInternetReachable !== false);
    })
  );
}

export { NetInfo };
