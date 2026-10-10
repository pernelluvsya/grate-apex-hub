import { Easing } from 'react-native-reanimated';

// GRATEAPEX motion system — every duration, spring and curve in one place.
//
// Hierarchy (use the smallest tier that communicates the change):
//   micro        120 ms  hover, press, toggles, focus
//   standard     220 ms  cards entering, tabs, selection pills
//   significant  420 ms  page sections, sheets, score arcs
//   special      900 ms+ rewards, the Apex countdown, the intro
//
// Reduced motion: components read `useReducedMotion()` (Reanimated) and
// either jump straight to the end state or use a short opacity fade.
// Ambient web effects stop through a `prefers-reduced-motion` media query.

export const MOTION = {
  micro: 120,
  standard: 220,
  significant: 420,
  special: 900,
} as const;

// Reanimated springs.
export const SPRING = {
  // Selection pills, tab indicators: quick and settled, no wobble.
  snappy: { damping: 24, stiffness: 320, mass: 0.8 },
  // Sheets and larger surfaces.
  gentle: { damping: 22, stiffness: 170, mass: 1 },
  // Celebratory pops (correct answer, reward): one small overshoot.
  pop: { damping: 13, stiffness: 220, mass: 0.7 },
} as const;

// CSS transition curves for web-only hover/press styles.
export const CSS_EASE = {
  standard: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// Shorthand for web `transition*` style props.
export function cssTransition(properties: string, duration: number = MOTION.micro, curve: string = CSS_EASE.standard) {
  return {
    transitionProperty: properties,
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: curve,
  };
}

// ── Existing defaults (kept: used by components/motion/*) ─────────────
export const MOTION_DURATION_MS = {
  content: 320,
  text: 300,
  countUp: 650,
} as const;

export const MOTION_STAGGER_MS = {
  character: 14,
  word: 32,
  item: 45,
} as const;

export const MOTION_DISTANCE = {
  content: 10,
  text: 4,
} as const;

export const MOTION_EASING = {
  entrance: Easing.out(Easing.cubic),
  countUp: Easing.out(Easing.cubic),
  standard: Easing.bezier(0.2, 0.7, 0.2, 1),
  emphasized: Easing.bezier(0.16, 1, 0.3, 1),
} as const;
