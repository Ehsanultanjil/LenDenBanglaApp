import { Text as RNText, TextInput as RNTextInput, type TextProps, type TextInputProps } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';

export function Text({ style, ...props }: TextProps) {
  const { fontFamily } = useLanguage();
  return <RNText style={[{ fontFamily }, style]} {...props} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  const { fontFamily } = useLanguage();
  return <RNTextInput style={[{ fontFamily }, style]} {...props} />;
}
