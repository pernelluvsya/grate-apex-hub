import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { COURSES } from "./data/catalog";
import { useColors, Colors } from "./theme";
import { Activity } from "./social";
import { timeAgo } from "./community";
import { MediaView } from "./MediaUI";
import { withIcons as wi } from "./components/em";

const courseName = (id: string) => { if (id === "mixed") return "🔀 mixed courses"; const c = COURSES.find((x) => x.id === id); return c ? `${c.icon} ${c.name}` : id; };

function describe(a: Activity): string {
  const d = a.data || {};
  switch (a.type) {
    case "quiz": { const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0; return `scored ${d.correct}/${d.total} (${pct}%) in ${courseName(d.course)} · +${d.xp} XP`; }
    case "level": return `reached Level ${d.level}, ${d.title} 🎉`;
    case "streak": return `is on a ${d.streak}-day streak 🔥`;
    case "post": return d.text ? `posted: ${d.text}` : "shared a post";
    case "reshare": return d.text ? `reshared: ${d.text}` : "reshared a post";
    case "quizShare": return d.text || `scored ${d.correct}/${d.total} (${d.pct}%) on ${d.title} · +${d.xp} XP`;
    case "recap": return `studied ${d.answered} questions over ${d.activeDays} ${d.activeDays === 1 ? "day" : "days"} this week · 🔥 ${d.streak} · ${d.title}`;
    default: return "did something great";
  }
}
const icon = (t: Activity["type"]) => (t === "quiz" ? "📝" : t === "level" ? "⭐" : t === "streak" ? "🔥" : t === "post" ? "💬" : t === "reshare" ? "🔁" : t === "quizShare" ? "🏆" : "📣");

// One line of activity. Used in the feed and on profiles.
export function ActivityLine({ a, compact, hideName }: { a: Activity; compact?: boolean; hideName?: boolean }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <View style={{ marginTop: compact ? 10 : 0 }}>
      <Text style={s.text}>{wi(icon(a.type))} {compact || hideName ? "" : `@${a.username} `}{wi(describe(a))}</Text>
      {a.type === "post" && <MediaView media={a.data?.media} width={compact ? 260 : 300} />}
      {a.type === "reshare" && !!a.data?.orig && (
        <View style={s.quote}>
          <Text style={s.qname}>@{a.data.orig.username}</Text>
          {!!a.data.orig.title && <Text style={[s.text, { fontWeight: "700" }]}>{a.data.orig.title}</Text>}
          {!!a.data.orig.text && <Text style={s.text}>{a.data.orig.text}</Text>}
          <MediaView media={a.data.orig.media} width={compact ? 240 : 280} />
        </View>
      )}
      {!hideName && <Text style={s.time}>{timeAgo(a.createdAt)}</Text>}
    </View>
  );
}


const makeStyles = (COLORS: Colors) => StyleSheet.create({
  text: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  quote: { marginTop: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 10, backgroundColor: COLORS.bg },
  qname: { color: COLORS.muted, fontSize: 12, fontWeight: "700", marginBottom: 2 },
  time: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
});
