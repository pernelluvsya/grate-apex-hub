import React from "react";
import { View } from "react-native";
import { Atmosphere } from "./components/atmosphere/atmosphere";
import { useAtmosphereMood, useAtmosphereOverride, type AtmosphereMood } from "./components/atmosphere/config";
import { useColors } from "./theme";

// The page background is the GRATEAPEX atmosphere: layered light behind every screen, with a mood
// that follows the screen (lively on Home, calm in Study, quiet on Profile, plain in a quiz).
// Screens stay transparent so it shows through.
export default function Background({ children }: { children: React.ReactNode }) {
  const C = useColors();
  const mood = useAtmosphereMood();
  return (
    <View style={{ flex: 1, backgroundColor: C.background, overflow: "hidden" }}>
      <Atmosphere mood={mood} />
      {children}
    </View>
  );
}

/** Renders nothing; pins the atmosphere mood while it is mounted (e.g. "auth" on sign-in, "focus" in a quiz). */
export function AtmosphereMoodPin({ mood }: { mood: AtmosphereMood }) {
  useAtmosphereOverride(mood);
  return null;
}
