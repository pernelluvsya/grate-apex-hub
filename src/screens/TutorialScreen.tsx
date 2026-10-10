import React, { useState, useMemo } from "react";
import { View } from "react-native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { Button, useScreen } from "../ui";
import { useColors, Colors } from "../theme";
import { useBackHandler } from "../backStack";
import { Glyph } from "../components/em";

const STEPS = [
  { emoji: "🧭", title: "Your 5 tabs", body: "Feed: what friends are doing. Compete: leaderboards and friends. Study: your courses. Community: discussions. You: your profile and progress." },
  { emoji: "🔥", title: "XP, rank and streaks", body: "Every question you answer earns XP and raises your rank. Study every day to keep your streak alive." },
  { emoji: "💬", title: "Follow and discuss", body: "Follow classmates to see their progress, and start or join a discussion on any course." },
];

export default function TutorialScreen() {
  const COLORS = useColors();
  const screen = useScreen();
  const { finishTutorial } = useAuth();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  useBackHandler(i > 0, () => setI(i - 1));

  return (
    <View style={screen.root}>
      <View style={{ alignSelf: "center", marginBottom: 16, width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primarySubtle, borderWidth: 1, borderColor: COLORS.primaryBorder }}><Glyph e={step.emoji} size={44} color={COLORS.accent} /></View>
      <Text style={[screen.title, { textAlign: "center" }]}>{step.title}</Text>
      <Text style={[screen.sub, { textAlign: "center", lineHeight: 22 }]}>{step.body}</Text>
      <Text style={{ color: COLORS.muted, textAlign: "center", marginBottom: 16 }}>{i + 1} / {STEPS.length}</Text>
      <Button title={last ? "Start studying" : "Next"} onPress={() => (last ? finishTutorial() : setI(i + 1))} />
      {!last && <Button variant="ghost" title="Skip" onPress={finishTutorial} />}
    </View>
  );
}
