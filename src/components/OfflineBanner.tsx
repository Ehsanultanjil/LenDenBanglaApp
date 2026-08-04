import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { NetInfo } from '@/lib/network';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Text } from './AppText';

/**
 * Distinguishes "you have no signal" from "the server broke" — without it both
 * look like a generic error, which is a common complaint on flaky mobile data.
 */
export function OfflineBanner() {
  const { strings } = useLanguage();
  const [offline, setOffline] = useState(false);

  useEffect(() =>
    NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected || state.isInternetReachable === false);
    }), []);

  if (!offline) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={strings.common.offline}
      className="flex-row items-center justify-center gap-2 bg-warning/15 py-2 px-4"
    >
      <WifiOff size={14} color="#FACC15" />
      <Text className="text-xs font-medium text-warning">{strings.common.offline}</Text>
    </View>
  );
}
