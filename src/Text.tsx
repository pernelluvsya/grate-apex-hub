import React, { useMemo } from "react";
import { TextStyleCtx } from "./components/em";
import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps, StyleSheet, TextStyle } from "react-native";

// Font system (GRATEAPEX): Nunito Sans for headings, Inter for everything else.
// - Headings (bold and 18px or larger, or any 24px+): Nunito Sans
// - Everything else, inputs included: Inter
// React Native picks a font file per weight, so fontWeight is translated into the matching file.
const FILES: Record<string, Record<number, string>> = {
  Nunito: { 400: "NunitoSans_700Bold", 500: "NunitoSans_700Bold", 600: "NunitoSans_700Bold", 700: "NunitoSans_700Bold", 800: "NunitoSans_800ExtraBold" },
  Inter: { 400: "Inter_400Regular", 500: "Inter_500Medium", 600: "Inter_600SemiBold", 700: "Inter_700Bold", 800: "Inter_800ExtraBold" },
};
// Names used by older screens map onto the two families above.
const ALIAS: Record<string, string> = { Poppins: "Nunito", Nunito: "Nunito", Montserrat: "Inter", Roboto: "Inter", Inter: "Inter" };

function family(style: any, _children?: any, forced?: string): TextStyle {
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const raw = parseInt(String(flat.fontWeight ?? "400"), 10) || 400;
  const w = raw >= 800 ? 800 : raw >= 700 ? 700 : raw >= 600 ? 600 : raw >= 500 ? 500 : 400;
  const fontSize = flat.fontSize ?? 16;
  const fam = forced ? ALIAS[forced] ?? "Inter" : (fontSize >= 24 || (raw >= 700 && fontSize >= 18)) ? "Nunito" : "Inter";
  return { fontFamily: FILES[fam][w], fontWeight: "normal" };
}
export function Text({ style, children, font, ...rest }: TextProps & { font?: string }) {
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const size = flat.fontSize ?? 16, color = flat.color as string | undefined;
  const ctx = useMemo(() => ({ size, color }), [size, color]);
  return <RNText {...rest} style={[style, family(style, children, font)]}><TextStyleCtx.Provider value={ctx}>{children}</TextStyleCtx.Provider></RNText>;
}
export function TextInput({ style, ...rest }: TextInputProps) {
  return <RNTextInput {...rest} style={[style, family(style, undefined, "Roboto")]} />;
}