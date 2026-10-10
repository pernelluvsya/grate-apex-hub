import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors as PALETTES, type ThemeColors } from "./constants/theme";
import { deriveTheme, type LegacySeed } from "./themes/derive";

// ---------------------------------------------------------------------------------------------
// Themes.
//
// The look comes from the GRATEAPEX design system (src/constants/theme.ts): every theme resolves to
// one full set of design tokens (surfaces, text, borders, status, navigation...). The first seven
// themes ARE the GRATEAPEX palettes. The rest are the Grate Apex Hub's unlockable themes, rebuilt on
// the same tokens so they look like they belong to the same app.
//
// `unlock` is the player level needed; `ach` is an achievement id that unlocks it (see achievements.ts).
// ---------------------------------------------------------------------------------------------
export type ThemeDef = {
  id: string; name: string; desc: string; unlock: number; light: boolean;
  swatch: [string, string, string];   // background, surface, accent: drawn in the picker (replaces the old emoji icon)
  tokens: ThemeColors;                // the full GRATEAPEX token set
  gradient?: string[];                // optional custom background gradient (rainbow)
  ach?: string;                       // achievement id that must be earned to unlock this theme
  adminOnly?: boolean;                // only shown to (and usable by) admins
};

const core = (id: string, name: string, desc: string, light: boolean): ThemeDef => {
  const t = (PALETTES as Record<string, ThemeColors>)[id];
  return { id, name, desc, unlock: 0, light, tokens: t, swatch: [t.background, t.surfaceElevated, t.primary] };
};

const legacy = (
  id: string, name: string, desc: string, unlock: number,
  seed: LegacySeed, extra: Partial<ThemeDef> = {},
): ThemeDef => {
  const tokens = deriveTheme(seed);
  return { id, name, desc, unlock, light: seed.light, tokens, swatch: [tokens.background, tokens.surfaceElevated, tokens.primary], ...extra };
};

export const THEMES: ThemeDef[] = [
  core("apex", "Apex", "The GRATEAPEX signature: cobalt and gold.", false),
  core("light", "Light", "Bright, warm and clean.", true),
  core("dark", "Dark", "Calm and easy on the eyes.", false),
  core("black", "Black", "Pure black for OLED screens.", false),
  core("violet", "Violet", "Deep purple with soft lilac accents.", false),
  core("pink", "Pink", "Rose tones on a dark base.", false),
  core("emerald", "Emerald", "Fresh green on deep forest.", false),
  legacy("charcoal", "Charcoal", "Sleek matte grey and black.", 0,
    { bg1: "#3a3a3d", bg2: "#232326", bg3: "#131315", ink: "#f2f2f2", silver: "#b7b7bc", dim: "#86868c", accent: "#9a9aa4", gold: "#d8b45a", light: false }),
  legacy("matcha", "Matcha", "Calm green tones.", 5,
    { bg1: "#dcefbf", bg2: "#8fbc5a", bg3: "#5c7a3a", ink: "#2b3a1a", silver: "#4a5c30", dim: "#6b7d4a", accent: "#4d7a22", gold: "#a97a2f", light: true }),
  legacy("gold", "Gold", "Rich gold and black luxury.", 8,
    { bg1: "#2b2308", bg2: "#1a1504", bg3: "#0d0a02", ink: "#fff6df", silver: "#d8b968", dim: "#a4893f", accent: "#ffd34d", gold: "#ffd34d", light: false }),
  legacy("cyberpunk", "Cyberpunk", "Neon grid, night city.", 10,
    { bg1: "#170a2e", bg2: "#2a0f52", bg3: "#1a0533", ink: "#ecfeff", silver: "#c9a6ff", dim: "#9a86c9", accent: "#ff2bd6", gold: "#00fff2", light: false }),
  legacy("desert", "Desert Dune", "Warm sand and sun.", 12,
    { bg1: "#f7e6bd", bg2: "#e8b872", bg3: "#d99a5b", ink: "#4a2c12", silver: "#7a4f26", dim: "#9c7248", accent: "#c1440e", gold: "#d98324", light: true }),
  legacy("retro", "8-Bit Retro", "Pixel arcade vibes.", 15,
    { bg1: "#0f0f1b", bg2: "#1e1e3f", bg3: "#0f0f1b", ink: "#f8f8f8", silver: "#ff6b9d", dim: "#9a9ad4", accent: "#39ff14", gold: "#ffd700", light: false }),
  legacy("lavender", "Lavender Haze", "Soft dreamy purple.", 18,
    { bg1: "#eee8fd", bg2: "#d4c5f9", bg3: "#c3aef5", ink: "#3a2a5c", silver: "#6b5490", dim: "#8f7aad", accent: "#7c5cc4", gold: "#b48cd9", light: true }),
  legacy("rainbow", "Rainbow", "Full colour party mode.", 20,
    { bg1: "#ff5f6d", bg2: "#7873f5", bg3: "#2a1f6b", ink: "#ffffff", silver: "#f3ecff", dim: "#e2d6ff", accent: "#ffe066", gold: "#ffe066", light: false },
    { gradient: ["#ff5f6d", "#ffc371", "#f9f871", "#7afcc6", "#4facfe", "#a06cff"] }),
  // Achievement themes: unlocked by earning the matching achievement (ignores level).
  legacy("christmas", "Christmas", "Pine green, holly red and a little gold.", 0,
    { bg1: "#14633d", bg2: "#0c4529", bg3: "#06281a", ink: "#fff8ee", silver: "#cfe9d6", dim: "#8fc2a0", accent: "#e63946", gold: "#ffd34d", light: false }, { ach: "xmas" }),
  legacy("valentine", "Valentine", "Deep rose and candy-heart pink.", 0,
    { bg1: "#9a1a45", bg2: "#661032", bg3: "#38061c", ink: "#fff0f5", silver: "#ffc4d8", dim: "#d98ba7", accent: "#ff5c8f", gold: "#ffb3cb", light: false }, { ach: "val" }),
  // Admin-only.
  legacy("brat", "brat", "Lime green. Black text. That's it. (Admins only)", 0,
    { bg1: "#8ace00", bg2: "#8ace00", bg3: "#8ace00", ink: "#000000", silver: "#1a1a1a", dim: "#3f5c00", accent: "#000000", gold: "#111111", light: true }, { adminOnly: true }),
];

// Ids saved by the older versions of the app map onto the new defaults.
const LEGACY_IDS: Record<string, string> = { blackout: "black" };
const normalizeId = (id: string | null | undefined) => (id && LEGACY_IDS[id]) || id || "apex";

// ---------------------------------------------------------------------------------------------
// What screens read with useColors(): the full GRATEAPEX tokens, plus the short names the Hub's
// screens have always used (bg, card, text, muted, primary...), now backed by those tokens.
// ---------------------------------------------------------------------------------------------
export type Colors = ThemeColors & {
  bg: string; card: string; text: string; muted: string; silver: string;
  primary: string; onPrimary: string; accent: string; danger: string;
  ok: string; okBg: string; badBg: string; light: boolean; gradient: string[]; id: string;
};

export function colorsOf(t: ThemeDef): Colors {
  const k = t.tokens;
  return {
    ...k,
    id: t.id, light: t.light,
    bg: k.background, card: k.surface, muted: k.textTertiary, silver: k.textSecondary,
    danger: k.error, ok: k.success, okBg: k.successSubtle, badBg: k.errorSubtle,
    gradient: t.gradient ?? [k.background, k.surfaceElevated, k.background],
  };
}

type Ctl = { colors: Colors; themeId: string; setThemeId: (id: string) => void };
const initial = THEMES[0];
const Ctx = createContext<Ctl>({ colors: colorsOf(initial), themeId: initial.id, setThemeId: () => { } });
const KEY = "ga:theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setId] = useState(initial.id);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      const id = normalizeId(v);
      if (v && THEMES.some((t) => t.id === id)) setId(id);
    }).catch(() => { });
  }, []);
  const setThemeId = (id: string) => { setId(id); AsyncStorage.setItem(KEY, id).catch(() => { }); };
  const value = useMemo(() => ({ colors: colorsOf(THEMES.find((t) => t.id === themeId) ?? initial), themeId, setThemeId }), [themeId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useColors = () => useContext(Ctx).colors;
export const useThemeCtl = () => useContext(Ctx);
/** The active theme's definition (for pickers and the atmosphere). */
export const useThemeDef = () => {
  const { themeId } = useContext(Ctx);
  return THEMES.find((t) => t.id === themeId) ?? initial;
};
