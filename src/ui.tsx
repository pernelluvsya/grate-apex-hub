import React, { useMemo, useState } from "react";
import { Platform, TouchableOpacity, Pressable, View, StyleSheet, TextInputProps } from "react-native";
import { Text, TextInput } from "./Text";
import { useColors, Colors } from "./theme";
import { useLayout } from "./responsive";
import { withIcons } from "./components/em";
import { Button as KitButton } from "./components/ui/button";
import { Interactive } from "./components/ui/interactive";
import { LogoMark } from "./components/logo-mark";
import { elevation, Radius, Type } from "./constants/theme";
import { webStyle } from "./components/ui/web";

// ---------------------------------------------------------------------------------------------
// The Hub's everyday building blocks, now drawn with the GRATEAPEX design system. Their props are
// unchanged, so every screen that already uses them picks up the new look automatically.
// ---------------------------------------------------------------------------------------------

export function Button({ title, onPress, loading, variant = "primary", disabled }: {
  title: string; onPress: () => void; loading?: boolean; variant?: "primary" | "ghost"; disabled?: boolean;
}) {
  return (
    <KitButton
      label={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      variant={variant === "ghost" ? "secondary" : "primary"}
      size="lg"
      fullWidth
      style={{ marginTop: 6 }}
    />
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { label, style, ...rest } = props;
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        style={[s.input, focused && s.inputFocus, style]}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <Interactive onPress={onPress} accessibilityLabel={label} accessibilityState={{ selected }} style={({ hovered }) => [s.chip, hovered && !selected && s.chipHover, selected && s.chipSel]}>
      <Text style={[s.chipText, selected && { color: COLORS.onPrimary }]}>{withIcons(label, { size: 16, color: selected ? COLORS.onPrimary : COLORS.textSecondary })}</Text>
    </Interactive>
  );
}

// A raised card surface (what used to be the frosted "glass" panel).
export function Panel({ children, style }: { children: React.ReactNode; style?: any }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  return <View style={[s.panel, style]}>{children}</View>;
}

// The GrAte Apex logo mark.
export function Logo({ size = 76 }: { size?: number }) {
  return (
    <View style={{ alignSelf: "flex-start", marginBottom: 18 }}>
      <LogoMark height={size * 0.8} />
    </View>
  );
}

export const makeScreen = (COLORS: Colors) => StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: "center" },
  title: { ...Type.title1, color: COLORS.text, marginBottom: 6 },
  sub: { ...Type.body, color: COLORS.textSecondary, marginBottom: 24 },
  error: { color: COLORS.error, marginBottom: 12 },
});
export function useScreen() {
  const COLORS = useColors();
  return useMemo(() => makeScreen(COLORS), [COLORS]);
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  label: { color: COLORS.textTertiary, fontSize: 12.5, fontWeight: "700", letterSpacing: 0.2, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surfaceSunken, borderColor: COLORS.border, borderWidth: 1, borderRadius: Radius.md, color: COLORS.text,
    paddingVertical: 13, paddingHorizontal: 14, fontSize: 16, ...webStyle({ outlineStyle: "none", transitionProperty: "border-color, box-shadow", transitionDuration: "120ms" }),
  },
  inputFocus: { borderColor: COLORS.focusRing, ...webStyle({ boxShadow: `0 0 0 3px ${COLORS.primarySubtle}` }) },
  chip: { paddingVertical: 11, paddingHorizontal: 17, borderRadius: Radius.pill, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, marginRight: 10, marginBottom: 10 },
  chipHover: { borderColor: COLORS.primaryBorder, backgroundColor: COLORS.surfaceMuted },
  chipSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontWeight: "700", fontSize: 14 },
  panel: { backgroundColor: COLORS.surface, borderColor: COLORS.hairline, borderWidth: 1, borderRadius: Radius.lg, padding: 18, marginBottom: 14, ...elevation(COLORS, 1) },
});

// A centred column. Phones fill it; wide windows get a comfortable maximum width (the background still fills the screen).
export function Column({ children, max = 760 }: { children: React.ReactNode; max?: number }) {
  return <View style={{ flex: 1, width: "100%", maxWidth: max, alignSelf: "center", overflow: "hidden", paddingHorizontal: 0 }}>{children}</View>;
}

// Page width for the main screens: wide on a computer, the phone column otherwise.
export function Wide({ children, max = 1100 }: { children: React.ReactNode; max?: number }) {
  const { desktop, wide } = useLayout();
  return <Column max={desktop ? max : wide ? 920 : 760}>{children}</Column>;
}

// A pressable card that lifts under the mouse (web) and works like a normal button on phones.
export function Hover({ children, onPress, style, disabled }: { children: React.ReactNode; onPress?: () => void; style?: any; disabled?: boolean }) {
  const COLORS = useColors();
  return (
    <Pressable onPress={onPress} disabled={disabled} style={(st: any) => [style, st.hovered && !disabled && { borderColor: COLORS.primaryBorder, transform: [{ translateY: -1 }] }, st.pressed && { opacity: 0.85 }, { cursor: disabled ? "default" : "pointer" } as any]}>
      {children}
    </Pressable>
  );
}

// Desktop (web) only: right-click a message, or hover it and click the reaction button, to open its menu
// (reactions, forward...). On phones this renders just the children, where long-press does the job.
export function HoverMenu({ children, mine, onMenu, maxW }: { children: React.ReactNode; mine?: boolean; onMenu: () => void; maxW?: any }) {
  const COLORS = useColors();
  const [hover, setHover] = useState(false);
  if (Platform.OS !== "web") return <>{children}</>;
  const web: any = {
    onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
    onContextMenu: (e: any) => { e?.preventDefault?.(); onMenu(); },
  };
  return (
    <View {...web} style={{ flexDirection: mine ? "row-reverse" : "row", alignItems: "center", alignSelf: mine ? "flex-end" : "flex-start", maxWidth: maxW ?? "100%" }}>
      <View style={{ flexShrink: 1 }}>{children}</View>
      <TouchableOpacity onPress={onMenu} accessibilityLabel="Message options" style={{ opacity: hover ? 1 : 0, padding: 6, marginHorizontal: 2, pointerEvents: hover ? "auto" : "none" } as any}>
        <Text style={{ fontSize: 16, color: COLORS.textTertiary, fontWeight: "800" }}>•••</Text>
      </TouchableOpacity>
    </View>
  );
}
