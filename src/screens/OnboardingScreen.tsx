import React, { useState, useMemo } from "react";
import { View } from "react-native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { Button, Chip, useScreen } from "../ui";
import { HALLS, SEMESTERS, Hall } from "../config";
import { useColors, Colors } from "../theme";
import { Em } from "../components/em";

// Roadmap step 2 and 3: hall and semester. More questions can be added below
// the same way once you decide what else to ask.
export default function OnboardingScreen() {
  const COLORS = useColors();
  const screen = useScreen();
  const { saveOnboarding, profile } = useAuth();
  const [hall, setHall] = useState<Hall | null>(profile?.hall ?? null);
  const [semester, setSemester] = useState<1 | 2 | null>(profile?.semester ?? null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const go = async () => {
    if (!hall || !semester) return;
    setBusy(true); setError("");
    try { await saveOnboarding(hall, semester); }
    catch (e: any) {
      // Keep the real code visible so problems can be diagnosed.
      setError(e?.code ? `Couldn't save (${e.code}). ${e?.message ?? ""}` : (e?.message ?? "Couldn't save. Please try again."));
    }
    finally { setBusy(false); }
  };

  if (confirm && hall && semester) {
    return (
      <View style={screen.root}>
        <Text style={screen.title}>Confirm your class</Text>
        <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 18, marginBottom: 16, alignItems: "center" }}>
          <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: "800" }}>{hall} · Semester {semester}</Text>
        </View>
        <Text style={[screen.sub, { color: COLORS.danger, fontWeight: "700" }]}><Em n="lock" /> This can't be changed later.</Text>
        <Text style={screen.sub}>Your courses, lessons and practice questions are based on this choice. Make sure it's right before you continue.</Text>
        {!!error && <Text style={screen.error}>{error}</Text>}
        <Button title="Yes, lock it in" onPress={go} loading={busy} />
        <Button title="Go back" variant="ghost" onPress={() => setConfirm(false)} disabled={busy} />
      </View>
    );
  }

  return (
    <View style={screen.root}>
      <Text style={screen.title}>Choose your class</Text>
      <Text style={screen.sub}>This sets the courses and content you see. You'll confirm it on the next step, and it can't be changed afterwards.</Text>

      <Text style={{ color: COLORS.text, fontWeight: "700", marginBottom: 10 }}>Which hall are you in?</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {HALLS.map((h) => <Chip key={h} label={h} selected={hall === h} onPress={() => setHall(h)} />)}
      </View>

      <Text style={{ color: COLORS.text, fontWeight: "700", marginVertical: 10 }}>Which semester?</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {SEMESTERS.map((n) => <Chip key={n} label={`Semester ${n}`} selected={semester === n} onPress={() => setSemester(n)} />)}
      </View>

      {!!error && <Text style={screen.error}>{error}</Text>}
      <View style={{ height: 16 }} />
      <Button title="Continue" onPress={() => setConfirm(true)} disabled={!hall || !semester} />
    </View>
  );
}