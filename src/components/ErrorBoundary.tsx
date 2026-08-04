import { Component, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, any render error unmounts the entire tree — in a release build
 * that leaves a blank screen with no way out but force-quitting the app.
 *
 * Deliberately does not use AppText or the i18n strings: this has to render even
 * if the providers above it are what failed, so it depends on nothing.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Replace with a crash reporter (Sentry etc.) before shipping widely.
    console.error('Unhandled error:', error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: '#090B10', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
          The app hit an unexpected problem. Your data is safe.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={() => this.setState({ error: null })}
          style={{ marginTop: 28, backgroundColor: '#46D6A8', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={{ color: '#090B10', fontSize: 16, fontWeight: '700' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
