import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { MOTION, SPRING } from '@/constants/motion';
import { elevation, isDesktopWidth, Radius, Type, type ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

/**
 * One overlay pattern for the whole app:
 *   phones  → a bottom sheet in the thumb zone (drag handle, rounded top)
 *   desktop → a centred dialog
 * Escape (web) and the Android back button close it; so does the scrim.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 520,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const desktop = isDesktopWidth(windowWidth);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  // Mount immediately on open; stay mounted until the exit animation ends.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = reduceMotion ? withTiming(1, { duration: MOTION.micro }) : withSpring(1, SPRING.gentle);
    } else {
      progress.value = withTiming(0, { duration: reduceMotion ? MOTION.micro : MOTION.standard, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, progress, reduceMotion]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const panelStyle = useAnimatedStyle(() =>
    desktop
      ? { opacity: Math.min(1, progress.value), transform: [{ scale: 0.96 + 0.04 * Math.min(1, progress.value) }] }
      : { transform: [{ translateY: (1 - progress.value) * Math.min(640, windowHeight) }] }
  );

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, desktop ? styles.rootDesktop : styles.rootMobile]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, scrimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.panel,
            elevation(colors, 3),
            desktop ? [styles.panelDesktop, { width: Math.min(width, windowWidth - 48), maxHeight: windowHeight - 80 }] : [styles.panelMobile, { maxHeight: windowHeight * 0.9, paddingBottom: insets.bottom + 8 }],
            panelStyle,
          ]}
        >
          {!desktop ? <View style={styles.handle} /> : null}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <IconButton icon="close" label="Close" onPress={onClose} size={36} />
          </View>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    rootDesktop: { alignItems: 'center', justifyContent: 'center' },
    rootMobile: { justifyContent: 'flex-end' },
    panel: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.hairline, overflow: 'hidden' },
    panelDesktop: { borderRadius: Radius.xl },
    panelMobile: { width: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0 },
    handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginTop: 10 },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 6 },
    headerText: { flex: 1, minWidth: 0, paddingTop: 4 },
    title: { ...Type.title3, color: colors.text },
    subtitle: { ...Type.callout, color: colors.textSecondary, marginTop: 2 },
    body: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 18, gap: 14 },
    footer: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: colors.divider, gap: 10 },
  });
}
