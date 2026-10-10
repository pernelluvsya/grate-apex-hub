import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../components/ui/icon";
import { PressableCard } from "../components/ui/interactive";
import { Type } from "../constants/theme";
import { Text } from "../Text";
import { THEMES, useColors, useThemeCtl, Colors } from "../theme";
import { useProgress, rankFor } from "../progress";
import Background from "../Background";
import { useAuth } from "../auth";
import { db } from "../firebase";
import { doc as fsDoc, getDoc } from "firebase/firestore";
import { ACHIEVEMENTS, earned } from "../achievements";

// Themes unlock as the student levels up, or by earning a specific achievement (Christmas / Valentine).
// Admin-only themes (brat) are hidden completely from everyone else.
export default function ThemePicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { themeId, setThemeId } = useThemeCtl();
  const { progress } = useProgress();
  const level = rankFor(progress.xp).level;
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); setAdminChecked(true); return; }
    let live = true;
    getDoc(fsDoc(db, "admins", user.uid))
      .then((d) => { if (live) { setIsAdmin(d.exists()); setAdminChecked(true); } })
      .catch(() => { if (live) setAdminChecked(true); });
    return () => { live = false; };
  }, [user?.uid]);
  const earnedIds = useMemo(() => earned(progress), [progress]);

  // If a non-admin somehow still has an admin-only theme saved (e.g. switched accounts), put them back on Dark.
  useEffect(() => {
    if (adminChecked && !isAdmin && THEMES.find((t) => t.id === themeId)?.adminOnly) setThemeId("apex");
  }, [adminChecked, isAdmin, themeId]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Background>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" style={s.closeRow}>
            <Icon name="chevronLeft" size={18} color={COLORS.accent} />
            <Text style={s.close}>Close</Text>
          </TouchableOpacity>
          <Text style={s.title}>Themes</Text>
          <Text style={s.sub}>You're Level {level}. Keep studying to unlock more.</Text>
          {THEMES.filter((t) => !t.adminOnly || isAdmin).map((t) => {
            const ach = t.ach ? ACHIEVEMENTS.find((a) => a.id === t.ach) : undefined;
            const achLocked = !!t.ach && !earnedIds.includes(t.ach);
            const locked = achLocked || level < t.unlock;
            const on = themeId === t.id;
            return (
              <PressableCard key={t.id} disabled={locked} onPress={() => { setThemeId(t.id); }} tone={on ? "primary" : "surface"} style={[s.row, locked && { opacity: 0.55 }]} accessibilityLabel={`${t.name} theme`}>
                <LinearGradient colors={(t.gradient ?? [t.swatch[0], t.swatch[1], t.swatch[0]]) as any} style={s.swatch}>
                  <View style={[s.dot, { backgroundColor: t.swatch[2] }]} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{t.name}</Text>
                  <Text style={s.desc}>{achLocked ? `Earn the "${ach?.name ?? t.ach}" achievement: ${ach?.desc ?? ""}` : locked ? `Unlocks at Level ${t.unlock}` : t.desc}</Text>
                </View>
                {locked ? <Icon name="lock" size={18} color={COLORS.textTertiary} /> : on ? <Icon name="check" size={20} color={COLORS.primaryText} strokeWidth={2.4} /> : null}
              </PressableCard>
            );
          })}
        </ScrollView>
      </Background>
    </Modal>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  closeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14, alignSelf: "flex-start" },
  close: { color: COLORS.accent, fontWeight: "700" },
  title: { ...Type.title1, color: COLORS.text, marginBottom: 4 },
  sub: { color: COLORS.silver, marginBottom: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, marginBottom: 10 },
  swatch: { width: 54, height: 54, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "rgba(255,255,255,0.7)" },
  name: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
  desc: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
});
