import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "./Text";
import { useColors } from "./theme";
import { MediaView } from "./MediaUI";
import { useProfileHost } from "./profileHost";
import type { Share } from "./messages";
import { withIcons as wi } from "./components/em";

// A post that someone sent you in a message. Tap it to see who wrote it.
export default function ShareCard({ s, mine }: { s: Share; mine?: boolean }) {
  const COLORS = useColors();
  const { open } = useProfileHost();
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => open(s.uid, s.username)}
      style={{ marginTop: 4, borderWidth: 1, borderColor: mine ? "rgba(255,255,255,0.35)" : COLORS.border, borderRadius: 12, padding: 10, backgroundColor: COLORS.bg }}>
      <Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: "800" }}>{s.kind === "post" ? wi("💬 COMMUNITY POST") : wi("📣 POST")} · @{s.username}</Text>
      {!!s.title && <Text style={{ color: COLORS.text, fontWeight: "700", marginTop: 3 }}>{s.title}</Text>}
      {!!s.text && <Text style={{ color: COLORS.text, marginTop: 3, lineHeight: 19 }} numberOfLines={6}>{s.text}</Text>}
      <MediaView media={s.media} width={200} />
    </TouchableOpacity>
  );
}
