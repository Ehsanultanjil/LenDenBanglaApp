import { Pressable, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HandCoins, Target, Receipt, User } from 'lucide-react-native';
import { Text } from './AppText';
import { useLanguage } from '@/i18n/LanguageProvider';

const ICONS = {
  debt: HandCoins,
  goals: Target,
  bills: Receipt,
  profile: User,
} as const;

const BAR_HEIGHT = 68;

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { strings } = useLanguage();

  const renderTab = (route: (typeof state.routes)[number]) => {
    const focused = state.index === state.routes.indexOf(route);
    const name = route.name as keyof typeof ICONS;
    const Icon = ICONS[name] ?? ICONS.debt;
    const label = strings.nav[name === 'bills' ? 'payments' : name] ?? strings.nav.debt;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        className="flex-1 items-center justify-center active:opacity-60"
      >
        <View className={`items-center gap-1 px-3 py-1.5 rounded-2xl ${focused ? 'bg-accent/15' : ''}`}>
          <Icon size={22} color={focused ? '#46D6A8' : '#94A3B8'} strokeWidth={2} />
          <Text className={`text-2xs font-medium ${focused ? 'text-accent' : 'text-text-secondary'}`}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <BlurView
      intensity={90}
      tint="dark"
      style={{ paddingBottom: insets.bottom, backgroundColor: 'rgba(9,11,16,0.55)' }}
      className="border-t border-divider overflow-hidden"
    >
      <View style={{ height: BAR_HEIGHT }} className="flex-row items-center">
        {state.routes.map(renderTab)}
      </View>
    </BlurView>
  );
}
