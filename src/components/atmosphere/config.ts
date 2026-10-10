import { useEffect, useSyncExternalStore } from 'react';

import type { ColorSchemeName, ThemeColors } from '@/constants/theme';
import { mix } from '@/themes/derive';

// The GRATEAPEX page atmosphere: the layered light behind every screen.
//
//   base field → tonal fields → aurora → light rays → faint grid
//   → localized gold glow → grain → vignette
//
// Each screen has a MOOD that sets how much of it shows: Home is lively,
// Learn is calm, the quiz is nearly plain (readability first), Profile and
// Settings are quiet. The Apex arena paints its own darker stage.

export type AtmosphereMood = 'lively' | 'expressive' | 'calm' | 'focus' | 'quiet' | 'auth';

type Tint = readonly [color: string, opacity: number];

export type AtmospherePalette = {
  base: string;
  fieldA: Tint; // light from the top-left
  fieldB: Tint; // side field (right)
  fieldC: Tint; // depth at the bottom
  auroraA: Tint;
  auroraB: Tint;
  auroraC: Tint; // the gold one
  grid: Tint;
  ray: Tint;
  gold: Tint; // localized glow behind the hero area
  vignette: Tint;
  grain: number; // opacity of the noise layer
  grainBlend: 'overlay' | 'multiply' | 'soft-light';
};

export const ATMOSPHERE: Record<ColorSchemeName, AtmospherePalette> = {
  apex: {
    base: '#132A9B',
    fieldA: ['#4B83FF', 0.52],
    fieldB: ['#080F63', 0.9],
    fieldC: ['#070E4F', 0.88],
    auroraA: ['#648EFF', 0.28],
    auroraB: ['#6179E6', 0.14],
    auroraC: ['#FDC00A', 0.12],
    grid: ['#D4E0FF', 0.035],
    ray: ['#CAD8FF', 0.055],
    gold: ['#FDC00A', 0.16],
    vignette: ['#03083F', 0.32],
    grain: 0.1,
    grainBlend: 'overlay',
  },
  light: {
    base: '#F6F6F2',
    fieldA: ['#1677F2', 0.1],
    fieldB: ['#7EB2FF', 0.11],
    fieldC: ['#E0E8F8', 0.8],
    auroraA: ['#1677F2', 0.11],
    auroraB: ['#91BCFF', 0.16],
    auroraC: ['#FDC00A', 0.09],
    grid: ['#122864', 0.045],
    ray: ['#1677F2', 0.055],
    gold: ['#FDC00A', 0.1],
    vignette: ['#1A2E6E', 0.07],
    grain: 0.05,
    grainBlend: 'multiply',
  },
  dark: {
    base: '#0B0D12',
    fieldA: ['#3678E7', 0.2],
    fieldB: ['#25458C', 0.24],
    fieldC: ['#05060A', 0.9],
    auroraA: ['#5A97FF', 0.19],
    auroraB: ['#5B83EA', 0.12],
    auroraC: ['#FDC00A', 0.05],
    grid: ['#FFFFFF', 0.03],
    ray: ['#9DB6FF', 0.045],
    gold: ['#FDC00A', 0.06],
    vignette: ['#000000', 0.5],
    grain: 0.07,
    grainBlend: 'overlay',
  },
  violet: {
    base: '#160F21', fieldA: ['#8A61CC', 0.22], fieldB: ['#392153', 0.52], fieldC: ['#090610', 0.88],
    auroraA: ['#B794FF', 0.2], auroraB: ['#8A61CC', 0.14], auroraC: ['#D9B8FF', 0.07], grid: ['#E0C8FF', 0.03], ray: ['#D4BEFF', 0.04], gold: ['#D9B8FF', 0.07], vignette: ['#08040E', 0.5], grain: 0.07, grainBlend: 'overlay',
  },
  black: {
    base: '#000000', fieldA: ['#FFFFFF', 0.045], fieldB: ['#8A8A91', 0.06], fieldC: ['#000000', 0.96],
    auroraA: ['#FFFFFF', 0.035], auroraB: ['#D4D4D8', 0.025], auroraC: ['#FFFFFF', 0.02], grid: ['#FFFFFF', 0.025], ray: ['#FFFFFF', 0.02], gold: ['#FFFFFF', 0.025], vignette: ['#000000', 0.7], grain: 0.055, grainBlend: 'overlay',
  },
  pink: {
    base: '#211019', fieldA: ['#FF8FBC', 0.2], fieldB: ['#73344F', 0.45], fieldC: ['#10070C', 0.88],
    auroraA: ['#FF8FBC', 0.18], auroraB: ['#A94B74', 0.13], auroraC: ['#FFC1D7', 0.07], grid: ['#FFD0E0', 0.03], ray: ['#FFD0E0', 0.04], gold: ['#FFC1D7', 0.07], vignette: ['#0C0308', 0.5], grain: 0.07, grainBlend: 'overlay',
  },
  emerald: {
    base: '#0D1915', fieldA: ['#2B986E', 0.3], fieldB: ['#174A37', 0.52], fieldC: ['#050B08', 0.9],
    auroraA: ['#52D6A2', 0.2], auroraB: ['#338A68', 0.14], auroraC: ['#8AE8C2', 0.07], grid: ['#A2F0D0', 0.03], ray: ['#7CE2B8', 0.04], gold: ['#8AE8C2', 0.07], vignette: ['#020A07', 0.52], grain: 0.07, grainBlend: 'overlay',
  },};

// How strongly each layer shows, per mood (0–1 multipliers).
export type MoodLevels = {
  fields: number;
  aurora: number;
  rays: number;
  grid: number;
  gold: number;
  grain: number;
  vignette: number;
  animate: boolean;
};

export const MOODS: Record<AtmosphereMood, MoodLevels> = {
  lively: { fields: 1, aurora: 0.9, rays: 0.7, grid: 0.6, gold: 1, grain: 1, vignette: 1, animate: true },
  expressive: { fields: 1, aurora: 1, rays: 0.5, grid: 0.85, gold: 0.7, grain: 1, vignette: 1, animate: true },
  calm: { fields: 0.8, aurora: 0.4, rays: 0, grid: 0.35, gold: 0.25, grain: 0.8, vignette: 0.8, animate: false },
  focus: { fields: 0.45, aurora: 0, rays: 0, grid: 0, gold: 0, grain: 0.5, vignette: 0.5, animate: false },
  quiet: { fields: 0.65, aurora: 0.25, rays: 0, grid: 0, gold: 0.2, grain: 0.7, vignette: 0.7, animate: false },
  auth: { fields: 1, aurora: 1, rays: 0.9, grid: 0.7, gold: 1, grain: 1, vignette: 1, animate: true },
};

// The mood follows the screen the learner is on. The navigator (screens/Tabs.tsx) reports the
// focused tab, and any full-screen flow can ask for a different mood while it is open with
// `useAtmosphereOverride('focus')`.
const TAB_MOODS: Record<string, AtmosphereMood> = {
  Feed: 'lively',
  Compete: 'expressive',
  Study: 'calm',
  Community: 'lively',
  You: 'quiet',
};

let tabMood: AtmosphereMood = 'lively';
let override: AtmosphereMood | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Called by the navigator with the name of the focused tab. */
export function setAtmosphereTab(routeName: string | null | undefined) {
  const next = (routeName && TAB_MOODS[routeName]) || 'lively';
  if (next === tabMood) return;
  tabMood = next;
  emit();
}

/** Pin a mood (e.g. 'auth' on the sign-in screens, 'focus' in a quiz). Pass null to release. */
export function setAtmosphereOverride(mood: AtmosphereMood | null) {
  if (override === mood) return;
  override = mood;
  emit();
}

export function useAtmosphereMood(): AtmosphereMood {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => override ?? tabMood,
    () => 'lively' as AtmosphereMood
  );
}

/** Pin a mood while the calling component is mounted. */
export function useAtmosphereOverride(mood: AtmosphereMood | null) {
  useEffect(() => {
    setAtmosphereOverride(mood);
    return () => setAtmosphereOverride(null);
  }, [mood]);
}

// A palette for any theme: the hand-tuned ones above, or one generated from the theme's tokens.
export function atmosphereFor(id: ColorSchemeName, t: ThemeColors, light: boolean): AtmospherePalette {
  const known = ATMOSPHERE[id];
  if (known) return known;
  return {
    base: t.background,
    fieldA: [t.primary, light ? 0.12 : 0.24],
    fieldB: [mix(t.background, t.primary, 0.3), light ? 0.16 : 0.45],
    fieldC: [light ? t.surfaceMuted : mix(t.background, '#000000', 0.6), light ? 0.8 : 0.88],
    auroraA: [t.primary, light ? 0.11 : 0.2],
    auroraB: [t.primary, 0.12],
    auroraC: [t.accent, 0.09],
    grid: [t.text, light ? 0.04 : 0.03],
    ray: [t.primary, light ? 0.05 : 0.045],
    gold: [t.accent, light ? 0.09 : 0.09],
    vignette: [light ? t.text : '#000000', light ? 0.06 : 0.46],
    grain: light ? 0.05 : 0.07,
    grainBlend: light ? 'multiply' : 'overlay',
  };
}

// '#RRGGBB' + opacity → 'rgba(r, g, b, a)'.
export function rgba([hex, opacity]: Tint, scale = 1) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, opacity * scale));
  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
}
