import { type TextProps } from 'react-native';
import { useCountUp } from '@/hooks/useCountUp';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Text } from './AppText';

interface AnimatedNumberProps extends TextProps {
  value: number;
  prefix?: string;
  compact?: boolean;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, prefix = '', compact = false, duration = 800, className, ...rest }: AnimatedNumberProps) {
  const animated = useCountUp(value, duration);
  const { formatCurrency } = useLanguage();
  return (
    <Text className={className} {...rest}>
      {prefix}{formatCurrency(Math.round(animated), compact)}
    </Text>
  );
}
