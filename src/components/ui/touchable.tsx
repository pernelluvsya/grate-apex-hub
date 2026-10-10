import { type ReactNode, useState } from 'react';
import {
  type AccessibilityRole,
  type AccessibilityState,
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useKeyboardModality, webStyle } from '@/components/ui/web';
import { useTheme } from '@/hooks/use-theme';

type TouchableProps = {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  testID?: string;
  hitSlop?: number;
  children?: ReactNode;
};

// A drop-in for TouchableOpacity with the GRATEAPEX interaction language:
// pointer cursor and a gentle hover tint on web, press feedback, and a
// visible focus ring for keyboard users. Same props as the subset of
// TouchableOpacity the app uses.
export function Touchable({
  onPress,
  onLongPress,
  disabled,
  style,
  activeOpacity = 0.75,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  hitSlop,
  children,
}: TouchableProps) {
  const colors = useTheme();
  const keyboard = useKeyboardModality();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled), ...accessibilityState }}
      testID={testID}
      style={({ pressed }) => [
        webStyle({
          cursor: disabled ? 'default' : 'pointer',
          outlineStyle: 'none',
          transitionProperty: 'opacity, filter, transform',
          transitionDuration: '120ms',
        }),
        style,
        hovered && !disabled && webStyle({ filter: 'brightness(0.97)' }),
        pressed && !disabled && { opacity: activeOpacity },
        focused &&
          keyboard &&
          webStyle({ outlineStyle: 'solid', outlineWidth: 2, outlineColor: colors.focusRing, outlineOffset: 2 }),
      ]}
    >
      {children}
    </Pressable>
  );
}
