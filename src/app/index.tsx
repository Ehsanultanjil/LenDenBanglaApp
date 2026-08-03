import { Redirect } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';

/**
 * The only thing at the bare "/" path. Neither (tabs) nor (auth) has its own
 * index route, so a cold launch has nowhere to land without this — it sends
 * you to whichever side Stack.Protected actually allows in.
 */
export default function Index() {
  const { session } = useAuth();
  return <Redirect href={session ? '/debt' : '/sign-in'} />;
}
