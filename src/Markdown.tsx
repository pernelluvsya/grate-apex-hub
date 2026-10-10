import React from "react";
import { View } from "react-native";
import { Text } from "./Text";

// Tiny renderer for the AI's replies: **bold**, *italic*, `code`, # headings, bullet and numbered lists.
// (No raw asterisks left on screen.)
function inline(s: string, color: string, accent: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+?\*\*|__[^_]+?__|\*[^*\s][^*]*?\*|`[^`]+`)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**") || t.startsWith("__")) out.push(<Text key={i++} style={{ fontWeight: "800", color }}>{t.slice(2, -2).replace(/\*/g, "")}</Text>);
    else if (t.startsWith("`")) out.push(<Text key={i++} style={{ color: accent, fontWeight: "700" }}>{t.slice(1, -1)}</Text>);
    else out.push(<Text key={i++} style={{ fontStyle: "italic", color }}>{t.slice(1, -1)}</Text>);
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  // anything unmatched: drop stray markers so no *** shows
  return out.map((n) => (typeof n === "string" ? n.replace(/\*+/g, (x) => (x.length > 1 ? "" : x)) : n));
}

export default function Markdown({ text, color, accent }: { text: string; color: string; accent: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const nodes: React.ReactNode[] = [];
  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (!line.trim()) { nodes.push(<View key={idx} style={{ height: 6 }} />); return; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\s*#{1,4}\s+(.*)$/))) {
      nodes.push(<Text key={idx} style={{ color, fontWeight: "800", fontSize: 16, marginTop: 4, marginBottom: 2 }}>{inline(m[1], color, accent)}</Text>);
    } else if ((m = line.match(/^(\s*)[-*•]\s+(.*)$/))) {
      nodes.push(
        <View key={idx} style={{ flexDirection: "row", marginLeft: m[1].length >= 2 ? 16 : 0, marginTop: 2 }}>
          <Text style={{ color: accent, width: 16 }}>•</Text>
          <Text style={{ color, flex: 1, lineHeight: 22 }}>{inline(m[2], color, accent)}</Text>
        </View>);
    } else if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
      nodes.push(
        <View key={idx} style={{ flexDirection: "row", marginTop: 2 }}>
          <Text style={{ color: accent, width: 22, fontWeight: "700" }}>{m[1]}.</Text>
          <Text style={{ color, flex: 1, lineHeight: 22 }}>{inline(m[2], color, accent)}</Text>
        </View>);
    } else if (/^\s*[-*_]{3,}\s*$/.test(line)) {
      nodes.push(<View key={idx} style={{ height: 1, backgroundColor: accent, opacity: 0.3, marginVertical: 6 }} />);
    } else {
      nodes.push(<Text key={idx} style={{ color, lineHeight: 22 }}>{inline(line, color, accent)}</Text>);
    }
  });
  return <View>{nodes}</View>;
}
