import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { LogoMark } from "@/components/logo-mark";
import { NAV_ITEMS, NavIconView } from "@/components/nav-items";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { webStyle } from "@/components/ui/web";
import { cssTransition, MOTION } from "@/constants/motion";
import { elevation, SIDEBAR_WIDTH, Type, type ThemeColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

// How close to the left edge the pointer must get before the rail appears, and the grace period before it hides again.
const REVEAL_ZONE_PX = 28;
const HIDE_DELAY_MS = 600;
const FLOAT_INSET = 10;

/**
 * Desktop navigation rail.
 *
 * Docked (auto-hide off): a full-height rail; the content is offset by SIDEBAR_WIDTH so nothing overlaps.
 * Auto-hide: the rail waits off-screen and floats in over the page when the pointer reaches the LEFT edge,
 * when the edge handle is clicked, or when keyboard focus enters it. It floats instead of pushing, so the
 * page never jumps sideways.
 */
export function DesktopSidebar({
  docked, activeRoute, onNavigate, badges = {}, bell, identity,
}: {
  docked: boolean; activeRoute: string; onNavigate: (route: string) => void; badges?: Record<string, number>;
  bell?: React.ReactNode;
  identity: { name: string; photo?: string; subtitle: string; streak: number; todayLabel?: string };
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const railHeight = Math.max(0, viewportHeight - (docked ? 0 : FLOAT_INSET * 2));
  const navIconSize = Math.min(24, railHeight / (NAV_ITEMS.length * 2));

  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = docked || revealed;

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  const reveal = useCallback(() => { clearTimer(); setRevealed(true); }, []);
  const scheduleHide = useCallback(() => { clearTimer(); timer.current = setTimeout(() => setRevealed(false), HIDE_DELAY_MS); }, []);

  useEffect(() => {
    if (docked || Platform.OS !== "web" || typeof document === "undefined") return;
    const onMove = (event: MouseEvent) => {
      if (event.clientX <= REVEAL_ZONE_PX) reveal();
      else if (revealed && event.clientX <= SIDEBAR_WIDTH + FLOAT_INSET * 2) clearTimer();
      else if (revealed && !timer.current) scheduleHide();
    };
    document.addEventListener("mousemove", onMove);
    return () => { document.removeEventListener("mousemove", onMove); clearTimer(); };
  }, [docked, revealed, reveal, scheduleHide]);

  const go = (route: string) => { onNavigate(route); if (!docked) scheduleHide(); };

  return (
    <>
      {!docked ? (
        <Pressable onPress={reveal} accessibilityRole="button" accessibilityLabel="Show navigation" style={[styles.handleZone, shown && styles.hidden]}>
          <View style={styles.handle} />
        </Pressable>
      ) : null}

      <View
        style={[styles.rail, docked ? styles.railDocked : [styles.railFloating, elevation(colors, 3)], !shown && styles.railHidden, { pointerEvents: shown ? "auto" : "none" }]}
        onFocus={!docked ? reveal : undefined}
        onBlur={!docked ? scheduleHide : undefined}
        role="navigation"
        aria-hidden={!shown}
      >
        <View style={styles.brandRow}>
          <LogoMark height={26} />
          <Text style={styles.wordmark} numberOfLines={1}>GrAte Apex</Text>
          {bell}
        </View>

        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const selected = item.route === activeRoute;
            const isHovered = hovered === item.route;
            const badge = badges[item.route] ?? 0;
            return (
              <Pressable
                key={item.route}
                onPress={() => go(item.route)}
                onHoverIn={() => setHovered(item.route)}
                onHoverOut={() => setHovered(null)}
                accessibilityRole="link"
                accessibilityLabel={item.accessibilityLabel}
                accessibilityState={{ selected }}
                tabIndex={shown ? 0 : -1}
                style={[styles.navItem, isHovered && styles.navItemHovered, selected && styles.navItemActive]}
              >
                {selected ? <View style={styles.activeBar} /> : null}
                <NavIconView icon={item.icon} color={selected ? colors.navActive : isHovered ? colors.text : colors.navInactive} size={navIconSize} active={selected} />
                <Text style={[styles.navLabel, (selected || isHovered) && styles.navLabelActive]} numberOfLines={1}>{item.label}</Text>
                {badge > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text></View> : null}
              </Pressable>
            );
          })}
        </View>

        {/* Today at a glance: real streak and XP. */}
        <View style={styles.today}>
          <View style={styles.todayItem}>
            <Icon name="streak" size={16} color={identity.streak > 0 ? colors.accent : colors.textTertiary} filled={identity.streak > 0} />
            <Text style={styles.todayText}>{identity.streak} day{identity.streak === 1 ? "" : "s"}</Text>
          </View>
          {identity.todayLabel ? (
            <View style={styles.todayItem}>
              <Icon name="xp" size={16} color={colors.accent} filled />
              <Text style={styles.todayText}>{identity.todayLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => go("You")}
            accessibilityRole="link"
            accessibilityLabel="Your profile"
            tabIndex={shown ? 0 : -1}
            onHoverIn={() => setHovered("identity")}
            onHoverOut={() => setHovered(null)}
            style={[styles.identity, hovered === "identity" && styles.navItemHovered]}
          >
            <Avatar uri={identity.photo} name={identity.name} size={34} ring="gold" />
            <View style={styles.identityText}>
              <Text style={styles.footerName} numberOfLines={1}>@{identity.name}</Text>
              <Text style={styles.footerRank} numberOfLines={1}>{identity.subtitle}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    handleZone: { position: "absolute", left: 0, top: "50%", marginTop: -48, width: 18, height: 96, justifyContent: "center", zIndex: 29, ...webStyle({ cursor: "pointer", ...cssTransition("opacity", MOTION.standard) }) },
    hidden: { opacity: 0 },
    handle: { marginLeft: 4, width: 4, height: 56, borderRadius: 2, backgroundColor: colors.accent, opacity: 0.55 },
    rail: {
      position: "absolute", zIndex: 30, width: SIDEBAR_WIDTH, paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12, backgroundColor: colors.navSurface,
      ...webStyle({ backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", ...cssTransition("transform, opacity", MOTION.standard) }),
    },
    railDocked: { top: 0, bottom: 0, left: 0, borderRightWidth: 1, borderRightColor: colors.navBorder },
    railFloating: { top: FLOAT_INSET, bottom: FLOAT_INSET, left: FLOAT_INSET, borderRadius: 22, borderWidth: 1, borderColor: colors.navBorder, backgroundColor: colors.surfaceElevated },
    railHidden: { opacity: 0, transform: [{ translateX: -(SIDEBAR_WIDTH + FLOAT_INSET * 2) }] },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 8, paddingBottom: 24 },
    wordmark: { flex: 1, fontSize: 18, fontWeight: "800", letterSpacing: 0.8, color: colors.logoLetters },
    navList: { flex: 1, gap: 4 },
    navItem: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: 12, overflow: "hidden", ...webStyle({ cursor: "pointer", outlineStyle: "none", ...cssTransition("background-color", MOTION.micro) }) },
    navItemHovered: { backgroundColor: colors.surfaceMuted },
    navItemActive: { backgroundColor: colors.navActiveSubtle },
    activeBar: { position: "absolute", left: 0, top: 10, bottom: 10, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, backgroundColor: colors.accent },
    navLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.navInactive },
    navLabelActive: { color: colors.text, fontWeight: "700" },
    badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: colors.error, alignItems: "center", justifyContent: "center" },
    badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    today: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 6, paddingBottom: 12 },
    todayItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.surfaceMuted },
    todayText: { ...Type.caption, fontWeight: "700", color: colors.textSecondary },
    footer: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider },
    identity: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10, padding: 6, borderRadius: 12, ...webStyle({ cursor: "pointer", outlineStyle: "none" }) },
    identityText: { flex: 1, minWidth: 0 },
    footerName: { fontSize: 13, fontWeight: "700", color: colors.text },
    footerRank: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  });
}
