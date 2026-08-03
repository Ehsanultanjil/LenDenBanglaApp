import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

/** Thrown when the user backs out of the Google sheet — not a real failure. */
export class SignInCancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'SignInCancelledError';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore any persisted session before the first paint decision.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithGoogle: async () => {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        if (!isSuccessResponse(response)) {
          throw new SignInCancelledError();
        }

        const idToken = response.data.idToken;
        if (!idToken) {
          throw new Error('Google did not return an ID token. Check that webClientId is correct.');
        }

        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) throw error;
      },
      signOut: async () => {
        // Clear the Google account selection too, otherwise the next sign-in
        // silently reuses the same account with no picker.
        try {
          await GoogleSignin.signOut();
        } catch (err) {
          if (!isErrorWithCode(err) || err.code !== statusCodes.SIGN_IN_REQUIRED) {
            throw err;
          }
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
