import { useId } from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Image } from 'expo-image';

import { AvatarPresetArt, getAvatarPreset } from '@/components/avatar/presets';
import { Type, type ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

export type AvatarRing = 'none' | 'primary' | 'gold' | 'subtle';

// Brand-only gradients for initials, picked from the name so the same
// person always gets the same colours.
const INITIAL_GRADIENTS: readonly (readonly [string, string])[] = [
  ['#2A5BD7', '#0B2C8A'],
  ['#1B3A94', '#0B1E5B'],
  ['#54A0FF', '#0F62D4'],
  ['#24408F', '#101F52'],
];

function getInitials(name: string) {
  const parts = name.replace(/^@/, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hash(text: string) {
  let value = 0;
  for (let i = 0; i < text.length; i++) value = (value * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(value);
}

/** One shared avatar renderer for profiles, posts, comments, messages and groups. */
export function Avatar({
  uri,
  name,
  size = 44,
  ring = 'none',
  status,
  style,
  label,
}: {
  uri?: string | null;
  name?: string | null;
  size?: number;
  ring?: AvatarRing;
  status?: 'online' | 'away' | null;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const colors = useTheme();
  const styles = useThemedStyles(createStyles);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const initials = getInitials(name?.trim() || 'GrAteApex Hub').slice(0, 2) || 'G';
  const gradient = INITIAL_GRADIENTS[hash(name ?? '') % INITIAL_GRADIENTS.length];
  const preset = getAvatarPreset(uri);

  const ringWidth = ring === 'none' ? 0 : size >= 64 ? 3 : 2;
  const gap = ring === 'none' ? 0 : size >= 64 ? 3 : 2;
  const inner = size - (ringWidth + gap) * 2;
  const ringColor =
    ring === 'gold' ? colors.accent : ring === 'primary' ? colors.primary : ring === 'subtle' ? colors.borderStrong : 'transparent';

  return (
    <View
      style={[{ width: size, height: size, borderRadius: size / 2, padding: gap, borderWidth: ringWidth, borderColor: ringColor }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label ?? (name ? `${name}'s avatar` : 'Avatar')}
    >
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, overflow: 'hidden' }}>
        {preset ? (
          <AvatarPresetArt preset={preset} size={inner} />
        ) : uri ? (
          <Image source={{ uri }} contentFit="cover" style={{ width: inner, height: inner }} accessibilityLabel={label ?? `${name ?? 'Learner'}'s profile photo`} />
        ) : (
          <View style={StyleSheet.absoluteFill}>
            <Svg width={inner} height={inner}>
              <Defs>
                <LinearGradient id={`g${uid}`} x1="0" y1="0" x2="0.5" y2="1">
                  <Stop offset="0" stopColor={gradient[0]} />
                  <Stop offset="1" stopColor={gradient[1]} />
                </LinearGradient>
              </Defs>
              <Circle cx={inner / 2} cy={inner / 2} r={inner / 2} fill={`url(#g${uid})`} />
            </Svg>
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <Text style={[styles.initials, { fontSize: Math.max(10, inner * 0.38) }]} numberOfLines={1}>
                {initials}
              </Text>
            </View>
          </View>
        )}
      </View>
      {status ? (
        <View
          style={[
            styles.status,
            {
              width: Math.max(8, size * 0.24),
              height: Math.max(8, size * 0.24),
              borderRadius: size,
              backgroundColor: status === 'online' ? colors.success : colors.warning,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

// Overlapping avatars with a "+N" chip, e.g. a study group.
export function AvatarStack({
  people,
  size = 32,
  max = 4,
  style,
}: {
  people: { id: string; name: string; uri?: string | null }[];
  size?: number;
  max?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <View style={[styles.stack, style]} accessibilityLabel={`${people.length} people`}>
      {shown.map((person, index) => (
        <View key={person.id} style={[styles.stackItem, { marginLeft: index === 0 ? 0 : -size * 0.2, borderRadius: size }]}>
          <Avatar uri={person.uri} name={person.name} size={size} />
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.stackItem, styles.more, { width: size + 4, height: size + 4, borderRadius: size, marginLeft: -size * 0.2 }]}>
          <Text style={styles.moreText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    initials: { ...Type.numeral, color: '#FFFFFF', letterSpacing: 0.5 },
    status: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2, borderColor: colors.surface },
    stack: { flexDirection: 'row', alignItems: 'center' },
    stackItem: { borderWidth: 2, borderColor: colors.surface },
    more: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
    moreText: { fontSize: 11, fontWeight: '800', color: colors.textSecondary },
  });
}
