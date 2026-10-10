import React, { useEffect, useMemo, useState, createContext, useContext } from "react";
import { View, StyleSheet, ScrollView, Image, Linking, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";
import { Text } from "../Text";
import { useColors, Colors } from "../theme";
import { Block, parseRich, fetchImage, Run } from "../lessons";

// Tapping an underlined word shows its meaning. The reader provides this.
export const TipCtx = createContext<(word: string, meaning: string) => void>(() => {});

const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "−": "₋", "=": "₌", "(": "₍", ")": "₎", a: "ₐ", e: "ₑ", o: "ₒ", x: "ₓ", h: "ₕ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", p: "ₚ", s: "ₛ", t: "ₜ" };
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "−": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", n: "ⁿ", i: "ⁱ" };
function script(t: string, map: Record<string, string>) { const out = Array.from(t).map((c) => map[c]); return out.every(Boolean) ? out.join("") : null; }

// Text with bold, italics, sub/superscripts and tappable terms.
export function Rich({ x, style }: { x: string; style?: any }) {
  const COLORS = useColors();
  const tip = useContext(TipCtx);
  const runs = useMemo(() => parseRich(x), [x]);
  return (
    <Text style={style}>
      {runs.map((r: Run, i) => {
        let t = r.t, st: any = {};
        if (r.sub || r.sup) { const m = script(t, r.sub ? SUB : SUP); if (m) t = m; else st.fontSize = 11; }
        if (r.b) st.fontWeight = "700";
        if (r.i) st.fontStyle = "italic";
        if (r.term) {
          st = { ...st, color: COLORS.light ? "#1d3fd1" : COLORS.accent, textDecorationLine: "underline", textDecorationStyle: "dotted" };
          return <Text key={i} style={st} onPress={() => tip(r.t, r.term!)}>{t}</Text>;
        }
        return <Text key={i} style={st}>{t}</Text>;
      })}
    </Text>
  );
}

function Fig({ b }: { b: Extract<Block, { k: "fig" }> }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (b.img) fetchImage(b.img).then((u) => (u ? setUri(u) : setFailed(true))); }, [b.img]);
  let ratio = b.w && b.h ? b.w / b.h : 1.5;
  if (b.svg) { const m = /viewBox="([\d.\s-]+)"/.exec(b.svg); if (m) { const v = m[1].trim().split(/\s+/).map(Number); if (v[2] && v[3]) ratio = v[2] / v[3]; } }
  if (b.svg && failed) return null;
  return (
    <View style={s.fig}>
      <View style={[s.figBox, { aspectRatio: ratio }]}>
        {b.svg ? <SvgXml xml={b.svg} width="100%" height="100%" onError={() => setFailed(true)} />
          : uri ? <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          : <Text style={s.muted}>{failed ? "Picture not available offline" : "Loading picture…"}</Text>}
      </View>
      {!!(b.cap || b.alt) && <Rich x={b.cap || b.alt || ""} style={s.cap} />}
    </View>
  );
}

const TONES: Record<string, (C: Colors) => string> = {
  gold: (C) => C.accent, red: (C) => C.danger, trap: (C) => C.danger, life: (C) => C.ok, sign: (C) => C.accent, big: (C) => C.primary, recall: (C) => C.accent, link: (C) => C.primary, formula: (C) => C.accent, mnemonic: (C) => C.accent,
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.k) {
          case "p": return <Rich key={i} x={b.x} style={b.lede ? s.lede : s.p} />;
          case "h": return <Rich key={i} x={b.x} style={b.l === 3 ? s.h3 : s.h4} />;
          case "ul": return (
            <View key={i} style={{ marginBottom: 12 }}>
              {b.items.map((it, j) => (
                <View key={j} style={s.li}>
                  <Text style={s.bullet}>{b.ol ? `${j + 1}.` : it.startsWith("– ") ? "" : "•"}</Text>
                  <Rich x={it} style={[s.p, { flex: 1, marginBottom: 0 }]} />
                </View>
              ))}
            </View>
          );
          case "table": return (
            <ScrollView key={i} horizontal style={{ marginBottom: 14 }} showsHorizontalScrollIndicator>
              <View style={s.table}>
                {!!b.head.length && <View style={[s.tr, s.thRow]}>{b.head.map((h, j) => <View key={j} style={s.cell}><Rich x={h} style={s.th} /></View>)}</View>}
                {b.rows.map((r, j) => <View key={j} style={[s.tr, j % 2 === 1 && s.trAlt]}>{r.c.map((c, k) => <View key={k} style={s.cell}><Rich x={c} style={s.td} /></View>)}</View>)}
              </View>
            </ScrollView>
          );
          case "term": return (
            <View key={i} style={s.term}>
              <Rich x={b.name} style={s.termName} />
              <Rich x={b.def} style={s.termDef} />
            </View>
          );
          case "box": {
            const col = (b.tone && TONES[b.tone] ? TONES[b.tone](COLORS) : COLORS.primary);
            return (
              <View key={i} style={[s.box, { borderLeftColor: col }]}>
                {!!b.title && <Rich x={b.title} style={[s.boxTitle, { color: col }]} />}
                <Blocks blocks={b.blocks} />
              </View>
            );
          }
          case "step": return (
            <View key={i} style={s.step}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{b.n}</Text></View>
              <View style={{ flex: 1 }}>
                <Rich x={b.title} style={s.stepTitle} />
                {b.blocks && <Blocks blocks={b.blocks} />}
                {!!b.tags?.length && <View style={s.tags}>{b.tags.map((t, j) => <View key={j} style={s.pill}><Text style={s.pillText}>{t}</Text></View>)}</View>}
              </View>
            </View>
          );
          case "cards": return (
            <View key={i}>
              {b.items.map((c, j) => (
                <View key={j} style={s.card}>
                  {!!c.title && <Rich x={c.title} style={s.cardTitle} />}
                  <Blocks blocks={c.blocks} />
                </View>
              ))}
            </View>
          );
          case "video": return (
            <TouchableOpacity key={i} style={s.video} onPress={() => Linking.openURL(b.url).catch(() => {})}>
              <Text style={s.videoIcon}>▶️</Text>
              <View style={{ flex: 1 }}>
                {!!b.tag && <Text style={s.muted}>{b.tag}</Text>}
                <Rich x={b.title} style={s.cardTitle} />
                <Rich x={b.desc} style={[s.p, { marginBottom: 0, fontSize: 13 }]} />
              </View>
            </TouchableOpacity>
          );
          case "fig": return <Fig key={i} b={b} />;
          default: return null;
        }
      })}
    </>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  p: { color: C.text, fontSize: 15.5, lineHeight: 25, marginBottom: 12 },
  lede: { color: C.text, fontSize: 17, lineHeight: 27, marginBottom: 14, fontWeight: "600" },
  h3: { color: C.text, fontSize: 18, fontWeight: "700", marginTop: 8, marginBottom: 8 },
  h4: { color: C.accent, fontSize: 15.5, fontWeight: "700", marginTop: 6, marginBottom: 6 },
  muted: { color: C.muted, fontSize: 12 },
  li: { flexDirection: "row", marginBottom: 6 },
  bullet: { color: C.accent, width: 22, fontSize: 15.5, lineHeight: 25, fontWeight: "700" },
  table: { borderColor: C.border, borderWidth: 1, borderRadius: 10, overflow: "hidden", minWidth: 320 },
  tr: { flexDirection: "row" },
  thRow: { backgroundColor: C.primary },
  trAlt: { backgroundColor: C.light ? "rgba(10,31,160,0.05)" : "rgba(255,255,255,0.05)" },
  cell: { width: 150, padding: 10, borderColor: C.border, borderRightWidth: StyleSheet.hairlineWidth },
  th: { color: C.onPrimary, fontSize: 13, fontWeight: "700" },
  td: { color: C.text, fontSize: 13.5, lineHeight: 20 },
  term: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  termName: { color: C.accent, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  termDef: { color: C.text, fontSize: 14.5, lineHeight: 22 },
  box: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderLeftWidth: 4, borderRadius: 14, padding: 14, marginBottom: 14 },
  boxTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  step: { flexDirection: "row", backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginRight: 12 },
  stepNumText: { color: C.onPrimary, fontWeight: "800", fontSize: 14 },
  stepTitle: { color: C.text, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  pill: { backgroundColor: C.light ? "rgba(10,31,160,0.08)" : "rgba(255,255,255,0.1)", borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, marginRight: 6, marginBottom: 6 },
  pillText: { color: C.text, fontSize: 12, fontWeight: "600" },
  card: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardTitle: { color: C.text, fontSize: 15.5, fontWeight: "700", marginBottom: 6 },
  video: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  videoIcon: { fontSize: 24, marginRight: 12 },
  fig: { marginBottom: 14 },
  figBox: { backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden", alignItems: "center", justifyContent: "center", width: "100%" },
  cap: { color: C.muted, fontSize: 12.5, lineHeight: 18, marginTop: 6, textAlign: "center" },
});
