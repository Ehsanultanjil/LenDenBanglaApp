import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';
import { Text } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { useAuth, SignInCancelledError } from '@/auth/AuthProvider';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { strings } = useLanguage();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const handleSignIn = async () => {
    if (!configured) {
      setError(strings.auth.notConfigured);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      // Backing out of the Google sheet is not an error worth showing.
      if (!(err instanceof SignInCancelledError)) {
        setError(err instanceof Error ? err.message : strings.auth.signInFailed);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      className="flex-1 bg-bg px-8 justify-center"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
    >
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-3xl bg-accent items-center justify-center mb-6">
          <Wallet size={38} color="#090B10" strokeWidth={2.2} />
        </View>
        <Text className="text-4xl font-bold text-text-primary">LenDen Bangla</Text>
        <Text className="text-base text-text-secondary text-center mt-3 leading-relaxed">
          {strings.auth.tagline}
        </Text>
      </View>

      <PressableScale
        onPress={handleSignIn}
        disabled={busy}
        className={`w-full py-4 rounded-2xl bg-accent flex-row items-center justify-center gap-2 ${busy ? 'opacity-50' : ''}`}
      >
        {busy ? (
          <>
            <ActivityIndicator color="#090B10" size="small" />
            <Text className="text-bg text-base font-bold">{strings.auth.signingIn}</Text>
          </>
        ) : (
          <Text className="text-bg text-base font-bold">{strings.auth.signInWithGoogle}</Text>
        )}
      </PressableScale>

      {error && (
        <Text className="text-sm text-danger text-center mt-4">{error}</Text>
      )}
    </View>
  );
}
