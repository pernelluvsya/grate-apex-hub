import { Colors as PALETTES, type ThemeColors } from "../constants/theme";

// Small colour helpers (hex only) used to build a full GRATEAPEX token set from the few colours
// the older Grate Apex Hub themes were defined with.
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = ([r, g, b]: number[]) => "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
/** Blend `a` towards `b` by `t` (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number) {
  const x = toRgb(a), y = toRgb(b);
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}
export function alpha(hex: string, a: number) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export function isBright(hex: string) {
  const [r, g, b] = toRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/** The colours an older theme was defined with. */
export type LegacySeed = {
  bg1: string; bg2: string; bg3: string; ink: string; silver: string; dim: string;
  accent: string; gold: string; light: boolean;
};

/** Build a complete GRATEAPEX token set from a legacy seed. */
export function deriveTheme(seed: LegacySeed): ThemeColors {
  const base: ThemeColors = seed.light ? PALETTES.light : PALETTES.dark;
  const { light, ink, accent, gold } = seed;
  const background = light ? seed.bg1 : seed.bg3;
  const surface = light ? mix(background, "#ffffff", 0.62) : mix(seed.bg3, seed.bg2, 0.6);
  const surfaceElevated = light ? mix(background, "#ffffff", 0.82) : mix(seed.bg3, seed.bg2, 0.92);
  const surfaceMuted = light ? mix(background, seed.bg2, 0.22) : mix(seed.bg3, seed.bg2, 0.42);
  const surfaceSunken = light ? mix(background, seed.bg2, 0.4) : mix(seed.bg3, "#000000", 0.28);
  const track = light ? mix(background, seed.bg2, 0.55) : mix(seed.bg3, seed.bg1, 0.3);
  const border = mix(surface, ink, light ? 0.16 : 0.18);
  const primaryText = light ? mix(accent, ink, 0.42) : mix(accent, "#ffffff", 0.25);
  const primarySubtle = mix(surface, accent, light ? 0.16 : 0.2);
  const accentText = light ? mix(gold, ink, 0.45) : gold;
  const shadowBase = light ? "16, 30, 80" : "0, 0, 0";
  return {
    ...base,
    primary: accent, primaryPressed: mix(accent, "#000000", 0.14), primaryText, primarySubtle,
    primaryBorder: mix(surface, accent, 0.5),
    onPrimary: isBright(accent) ? "#0A1F5C" : "#FFFFFF",
    onPrimaryMuted: mix(accent, isBright(accent) ? "#0A1F5C" : "#FFFFFF", 0.4),
    secondary: ink, onSecondary: background,
    accent: gold, accentSubtle: mix(surface, gold, 0.16), accentText,
    background, surface, surfaceElevated, surfaceMuted, surfaceSunken, track,
    text: ink, textSecondary: seed.silver, textTertiary: light ? mix(seed.dim, ink, 0.2) : mix(seed.dim, "#ffffff", 0.2),
    textDisabled: mix(seed.dim, background, 0.45),
    border, borderStrong: mix(surface, ink, light ? 0.3 : 0.32), divider: mix(surface, ink, 0.09),
    hairline: alpha(ink, 0.08), highlight: light ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.07)",
    info: accent, infoSubtle: primarySubtle, infoText: primaryText,
    tabBar: surface, tabBarBorder: border, tabActive: accent, tabInactive: seed.dim,
    navSurface: alpha(surface, 0.9), navBorder: alpha(ink, 0.12), navActive: light ? primaryText : accent,
    navActiveSubtle: primarySubtle, navInactive: light ? mix(seed.dim, ink, 0.2) : seed.dim,
    rewardBackground: light ? mix(seed.bg3, "#000000", 0.5) : mix(seed.bg3, "#000000", 0.3),
    logoLetters: light ? "#1245C4" : "#FFFFFF",
    stateLearning: accent, focusRing: accent,
    shadow: `rgba(${shadowBase}, ${light ? 0.1 : 0.45})`, shadowStrong: `rgba(${shadowBase}, ${light ? 0.18 : 0.62})`,
    overlay: `rgba(${light ? "10, 18, 45" : "0, 0, 0"}, ${light ? 0.4 : 0.66})`,
    backgroundElement: surfaceMuted, backgroundSelected: track,
  };
}
