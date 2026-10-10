import { useEffect } from 'react';
import { StyleSheet, Text, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { elevation, Radius, Type, type ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

type Action = { label: string; onPress: () => void };

// Every important learning operation has a real empty / loading / error
// state, drawn with the GRATEAPEX icon set (no emoji).

// A medallion behind a state icon: a soft ring of the brand colour.
function StateMark({ icon, tone = 'primary' }: { icon: IconName; tone?: 'primary' | 'warning' | 'error' | 'success' }) {
  const colors = useTheme();
  const styles = useThemedStyles(createStyles);
  const color = tone === 'warning' ? colors.warning : tone === 'error' ? colors.error : tone === 'success' ? colors.success : colors.primaryText;
  const bg = tone === 'warning' ? colors.warningSubtle : tone === 'error' ? colors.errorSubtle : tone === 'success' ? colors.successSubtle : colors.primarySubtle;
  return (
    <View style={[styles.mark, { backgroundColor: bg }]}>
      <Icon name={icon} size={26} color={color} />
    </View>
  );
}

export function EmptyState({
  icon = 'sparkle',
  title,
  message,
  action,
  style,
}: {
  icon?: IconName | string; // legacy emoji strings fall back to a neutral icon
  title: string;
  message?: string;
  action?: Action;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  const name: IconName = isIconName(icon) ? icon : 'sparkle';
  return (
    <View style={[styles.box, style]}>
      <StateMark icon={name} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? <Button label={action.label} onPress={action.onPress} variant="secondary" style={styles.action} /> : null}
    </View>
  );
}

// Full-screen error for a missing lesson/topic/quiz or an invalid link.
export function ErrorScreen({
  title,
  message,
  primary,
  secondary,
}: {
  title: string;
  message: string;
  primary: Action;
  secondary?: Action;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.screen} accessibilityRole="alert">
      <View style={styles.errorCard}>
        <StateMark icon="explore" tone="warning" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Button label={primary.label} onPress={primary.onPress} />
          {secondary ? <Button label={secondary.label} onPress={secondary.onPress} variant="secondary" /> : null}
        </View>
      </View>
    </View>
  );
}

// Loading: a skeleton of the page's shape, not a lone spinner.
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite" accessibilityLabel={label}>
      <Skeleton width="45%" height={28} radius={10} />
      <Skeleton width="70%" height={14} />
      <View style={styles.loadingCard}>
        <Skeleton width="35%" height={12} />
        <Skeleton width="90%" height={18} />
        <Skeleton width="80%" height={18} />
        <Skeleton width={140} height={40} radius={14} style={styles.loadingButton} />
      </View>
      <View style={styles.loadingRow}>
        <Skeleton height={86} radius={18} style={styles.flex} />
        <Skeleton height={86} radius={18} style={styles.flex} />
      </View>
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

// A shimmering placeholder block (static under reduced motion).
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.45 }));
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: colors.track }, animated, style]} />;
}

export function InlineNotice({
  tone = 'info',
  title,
  message,
}: {
  tone?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const icon: IconName = tone === 'success' ? 'check' : tone === 'info' ? 'info' : 'warning';
  const iconColor = tone === 'success' ? colors.successText : tone === 'warning' ? colors.warningStrong : tone === 'error' ? colors.error : colors.primaryText;
  return (
    <View style={[styles.notice, styles[tone]]} accessibilityRole={tone === 'error' ? 'alert' : undefined}>
      <Icon name={icon} size={18} color={iconColor} style={styles.noticeIcon} />
      <View style={styles.flex}>
        {title ? <Text style={[styles.noticeTitle, styles[`${tone}Text` as const]]}>{title}</Text> : null}
        <Text style={styles.noticeText}>{message}</Text>
      </View>
    </View>
  );
}

const ICON_NAMES = new Set<string>([
  'home', 'explore', 'learn', 'social', 'profile', 'settings', 'bell', 'search', 'calendar', 'reinforce', 'lesson', 'course',
  'chart', 'sparkle', 'research', 'mastery', 'achievement', 'challenge', 'book', 'info', 'warning', 'lock', 'upload',
]);
function isIconName(value: string): value is IconName {
  return ICON_NAMES.has(value);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    mark: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    box: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 20,
      borderRadius: Radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.hairline,
      ...elevation(colors, 1),
    },
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    errorCard: {
      width: '100%',
      maxWidth: 460,
      alignItems: 'center',
      padding: 28,
      borderRadius: Radius.xl,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.hairline,
      ...elevation(colors, 2),
    },
    title: { ...Type.title3, color: colors.text, textAlign: 'center', marginBottom: 6 },
    message: { ...Type.callout, color: colors.textSecondary, textAlign: 'center' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 18 },
    action: { marginTop: 14 },
    loading: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingTop: 40, gap: 12 },
    loadingCard: {
      gap: 10,
      padding: 18,
      borderRadius: Radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.hairline,
      marginTop: 8,
    },
    loadingButton: { marginTop: 6 },
    loadingRow: { flexDirection: 'row', gap: 12 },
    loadingText: { ...Type.caption, color: colors.textTertiary, textAlign: 'center', marginTop: 6 },
    notice: { flexDirection: 'row', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1 },
    noticeIcon: { marginTop: 1 },
    info: { backgroundColor: colors.primarySubtle, borderColor: colors.primaryBorder },
    warning: { backgroundColor: colors.warningSubtle, borderColor: colors.warningBorder },
    error: { backgroundColor: colors.errorSubtle, borderColor: colors.errorBorder },
    success: { backgroundColor: colors.successSubtle, borderColor: colors.successBorder },
    noticeTitle: { ...Type.overline, marginBottom: 4 },
    infoText: { color: colors.primaryText },
    warningText: { color: colors.warningStrong },
    errorText: { color: colors.error },
    successText: { color: colors.successText },
    noticeText: { ...Type.callout, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  });
}
