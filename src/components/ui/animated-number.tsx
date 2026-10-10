import { type StyleProp, Text, type TextStyle } from 'react-native';

import { MOTION } from '@/constants/motion';
import { useTween } from '@/hooks/use-tween';

// A number that counts to its value (results, XP, stats). Screen readers
// get the final value immediately.
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = MOTION.special,
  delay = 0,
  signed = false,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  signed?: boolean; // show "+" for positive values
  style?: StyleProp<TextStyle>;
}) {
  const animated = useTween(value, duration, delay);
  const shown = Number(animated.toFixed(decimals));
  const sign = signed && value > 0 ? '+' : value < 0 ? '−' : '';
  const final = `${prefix}${sign}${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: decimals })}${suffix}`;
  return (
    <Text style={style} accessibilityLabel={final}>
      {prefix}
      {sign}
      {Math.abs(shown).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </Text>
  );
}
