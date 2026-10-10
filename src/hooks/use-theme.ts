import { useMemo } from "react";

import type { ColorSchemeName, ThemeColors } from "@/constants/theme";
import { useColors, useThemeCtl } from "@/theme";

// Bridge between the GRATEAPEX design components (src/components/ui/*) and the Hub's theme store
// (src/theme.tsx). The store holds the learner's chosen theme; this returns its design tokens.
export function useResolvedColorScheme(): ColorSchemeName {
  return useThemeCtl().themeId;
}

export function useTheme(): ThemeColors {
  return useColors();
}

// Builds a screen's styles from the active palette. Rebuilt only when the theme changes.
export function useThemedStyles<T>(createStyles: (colors: ThemeColors) => T): T {
  const colors = useTheme();
  return useMemo(() => createStyles(colors), [createStyles, colors]);
}
