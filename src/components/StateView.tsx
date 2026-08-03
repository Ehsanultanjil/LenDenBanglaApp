import { ActivityIndicator, View } from 'react-native';
import { Text } from './AppText';
import { PressableScale } from './PressableScale';
import { useLanguage } from '@/i18n/LanguageProvider';

export function LoadingState() {
  const { strings } = useLanguage();
  return (
    <View className="items-center py-20 gap-3">
      <ActivityIndicator color="#46D6A8" />
      <Text className="text-sm text-text-secondary">{strings.common.loading}</Text>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { strings } = useLanguage();
  return (
    <View className="items-center py-20 gap-3 px-8">
      <Text className="text-base font-semibold text-text-primary text-center">
        {strings.common.errorTitle}
      </Text>
      <PressableScale onPress={onRetry} className="px-5 py-2.5 rounded-full bg-card">
        <Text className="text-sm font-semibold text-accent">{strings.common.retry}</Text>
      </PressableScale>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center py-16 px-8">
      <Text className="text-sm text-text-secondary text-center">{message}</Text>
    </View>
  );
}
