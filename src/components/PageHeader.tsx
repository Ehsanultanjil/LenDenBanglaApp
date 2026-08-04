import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { PressableScale } from './PressableScale';
import { Text } from './AppText';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, back = false, right }: PageHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 24 }} className="px-5 pb-4 flex-row items-center gap-3">
      {back && (
        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-card items-center justify-center shrink-0"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </PressableScale>
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-2xl font-bold text-text-primary" numberOfLines={1}>{title}</Text>
        {subtitle && <Text className="text-sm text-text-secondary mt-0.5" numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
