import { useState } from 'react';
import { View, ScrollView, Alert, Image, Linking, ActivityIndicator } from 'react-native';
import { Shield, CircleHelp, LogOut, ChevronRight, Languages, Trash2 } from 'lucide-react-native';
import { PageHeader } from '@/components/PageHeader';
import { PressableScale } from '@/components/PressableScale';
import { Text } from '@/components/AppText';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useAuth } from '@/auth/AuthProvider';
import { useDebts } from '@/api/debts';
import { useGoals } from '@/api/goals';
import { useBills } from '@/api/bills';

/** Update these before release — both are required by Google Play. */
const PRIVACY_POLICY_URL = 'https://example.com/lendenbangla/privacy';
const SUPPORT_EMAIL = 'support@example.com';

function SettingsRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const Wrapper = onPress ? PressableScale : View;
  return (
    <Wrapper
      {...(onPress
        ? { onPress, accessibilityRole: 'button' as const, accessibilityLabel: title, accessibilityHint: subtitle }
        : {})}
      className="w-full flex-row items-center gap-4 px-5 py-4"
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center shrink-0 ${danger ? 'bg-danger/10' : 'bg-card-hover'}`}>
        {icon}
      </View>
      <View className="flex-1 min-w-0">
        <Text className={`text-base font-medium ${danger ? 'text-danger' : 'text-text-primary'}`} numberOfLines={1}>{title}</Text>
        {subtitle && <Text className="text-sm text-text-secondary mt-0.5" numberOfLines={2}>{subtitle}</Text>}
      </View>
      {right ?? (onPress && !danger ? <ChevronRight size={18} color="#94A3B8" /> : null)}
    </Wrapper>
  );
}

export default function ProfileScreen() {
  const { language, setLanguage, strings, formatNumber } = useLanguage();
  const t = strings.profile;
  const { user, signOut, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const { data: debts } = useDebts();
  const { data: goals } = useGoals();
  const { data: bills } = useBills();

  const openDebts = debts?.length ?? 0;
  const activeGoals = goals?.length ?? 0;
  const upcomingBills = bills?.filter((b) => b.status === 'upcoming').length ?? 0;

  const meta = user?.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? '';
  const email = user?.email ?? '';
  const avatarUrl: string | undefined = meta.avatar_url ?? meta.picture;
  const initial = (fullName || email || '?').charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert(t.logOutConfirmTitle, t.logOutConfirmBody, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logOut,
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert(t.logOutFailed);
          }
        },
      },
    ]);
  };

  // Google Play requires an in-app way to delete the account, not just sign out.
  const handleDeleteAccount = () => {
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmBody, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.deleteConfirmAction,
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteAccount();
            Alert.alert(t.deleted);
          } catch {
            Alert.alert(t.deleteFailed);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-bg">
      <PageHeader title={t.title} />

      <View className="px-5 pb-8">
        <View className="bg-card rounded-3xl p-5 items-center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-20 h-20 rounded-full mb-4"
              accessibilityIgnoresInvertColors
              accessible
              accessibilityLabel={fullName || email}
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-4">
              <Text className="text-3xl font-bold text-bg">{initial}</Text>
            </View>
          )}
          {fullName ? <Text className="text-xl font-bold text-text-primary">{fullName}</Text> : null}
          {email ? <Text className="text-sm text-text-secondary mt-1">{email}</Text> : null}
          <View className="flex-row justify-center gap-6 mt-5 pt-5 border-t border-divider w-full">
            <View className="items-center flex-1" accessible accessibilityLabel={`${openDebts} ${t.debts}`}>
              <Text className="text-2xl font-bold text-text-primary">{formatNumber(openDebts)}</Text>
              <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.debts}</Text>
            </View>
            <View className="w-px bg-divider" />
            <View className="items-center flex-1" accessible accessibilityLabel={`${activeGoals} ${t.goals}`}>
              <Text className="text-2xl font-bold text-text-primary">{formatNumber(activeGoals)}</Text>
              <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.goals}</Text>
            </View>
            <View className="w-px bg-divider" />
            <View className="items-center flex-1" accessible accessibilityLabel={`${upcomingBills} ${t.dueSoon}`}>
              <Text className="text-2xl font-bold text-text-primary">{formatNumber(upcomingBills)}</Text>
              <Text className="text-2xs text-text-secondary uppercase tracking-wider">{t.dueSoon}</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 bg-card rounded-3xl overflow-hidden">
          <SettingsRow
            icon={<Languages size={18} color="#46D6A8" />}
            title={t.language}
            subtitle={t.languageSubtitle}
            onPress={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            right={
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm text-text-secondary">{language === 'en' ? 'English' : 'বাংলা'}</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </View>
            }
          />
          <View className="h-px bg-divider mx-5" />
          <SettingsRow
            icon={<Shield size={18} color="#46D6A8" />}
            title={t.privacySecurity}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          />
          <View className="h-px bg-divider mx-5" />
          <SettingsRow
            icon={<CircleHelp size={18} color="#46D6A8" />}
            title={t.helpSupport}
            onPress={() =>
              Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=LenDen%20Bangla%20support`)
            }
          />
        </View>

        <View className="mt-4 bg-card rounded-3xl overflow-hidden">
          <SettingsRow
            icon={<LogOut size={18} color="#F87171" />}
            title={t.logOut}
            danger
            onPress={handleLogout}
          />
          <View className="h-px bg-divider mx-5" />
          <SettingsRow
            icon={
              deleting ? <ActivityIndicator size="small" color="#F87171" /> : <Trash2 size={18} color="#F87171" />
            }
            title={t.deleteAccount}
            subtitle={t.deleteAccountSubtitle}
            danger
            onPress={deleting ? undefined : handleDeleteAccount}
          />
        </View>

        <Text className="text-center text-2xs text-text-secondary mt-6">{t.footer}</Text>
      </View>
    </ScrollView>
  );
}
