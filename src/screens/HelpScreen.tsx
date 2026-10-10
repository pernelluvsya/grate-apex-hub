import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { addDoc, collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { Text, TextInput } from "../Text";
import { useAuth } from "../auth";
import { useColors } from "../theme";
import Background from "../Background";
import { Column } from "../ui";
import Icon from "../Icon";
import { timeAgo } from "../community";
import { notify } from "../notifications";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

const WHATSAPP = (process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP || "").replace(/[^0-9]/g, "");
const EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "";

const CATS = [["account", "Account"], ["payment", "Payments"], ["content", "Wrong question / lesson"], ["bug", "Something's broken"], ["other", "Other"]] as const;
type Ticket = { id: string; uid: string; username: string; category: string; message: string; status: "open" | "closed"; reply?: string; createdAt: number };

const FAQ: [string, string][] = [
  ["How do I earn XP?", "Answer practice questions (+5 each right, a bonus for finishing a round and for a perfect score), do the Question of the Day, and win XP battles. Wrong answers cost a little, so read the explanations."],
  ["What are XP battles?", "A live head-to-head quiz with a friend. You both stake some XP, answer the same 7 questions, and the winner takes the pot. A draw gives everyone their stake back. Find it in Compete."],
  ["Can I change my hall or semester?", "No. It's locked when you sign up so everyone gets the right content. If you picked the wrong one, send us a message here with the category \"Account\" and we'll fix it."],
  ["I paid but Premium isn't active", "Card and mobile-money payments through Paystack unlock automatically within a minute (try closing and reopening the app). If you paid by sending MoMo manually, it can take a few hours for us to confirm. Message us with your transaction reference."],
  ["I found a wrong question or answer", "Thank you! Send it here under \"Wrong question / lesson\" and tell us the course and what the question says."],
  ["I'm not getting notifications", "Open the 🔔, then turn on \"Get notified on this device\" (or You → Push notifications). On iPhone, first add the app to your Home Screen. If it says Blocked, allow notifications for this site in your browser settings."],
  ["How do I delete a post or story?", "Open it and tap the bin icon. You can only delete your own posts, comments and stories."],
];

export default function HelpScreen({ visible, onClose, isAdmin }: { visible: boolean; onClose: () => void; isAdmin: boolean }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [cat, setCat] = useState<string>("other");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [mine, setMine] = useState<Ticket[]>([]);
  const [inbox, setInbox] = useState<Ticket[]>([]);
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const s = await getDocs(query(collection(db, "supportTickets"), where("uid", "==", user.uid), limit(30)));
      setMine(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).sort((a, b) => b.createdAt - a.createdAt));
    } catch { /* ignore */ }
    if (isAdmin) {
      try {
        const s = await getDocs(query(collection(db, "supportTickets"), where("status", "==", "open"), limit(50)));
        setInbox(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).sort((a, b) => a.createdAt - b.createdAt));
      } catch (e: any) { setErr(`Couldn't load the inbox (${e?.code ?? "error"}).`); }
    }
  }, [user, isAdmin]);
  useEffect(() => { if (visible) load(); }, [visible, load]);

  const send = async () => {
    if (!user || !profile || msg.trim().length < 5) return;
    setBusy(true); setErr("");
    try {
      await addDoc(collection(db, "supportTickets"), { uid: user.uid, username: profile.username, category: cat, message: msg.trim().slice(0, 1000), status: "open", createdAt: Date.now() });
      setMsg(""); setSent(true); load();
    } catch (e: any) { setErr(`Couldn't send (${e?.code ?? "error"}). Check your internet and try again.`); }
    setBusy(false);
  };
  const answer = async (t: Ticket, close: boolean) => {
    const text = (reply[t.id] ?? "").trim();
    try {
      await updateDoc(doc(db, "supportTickets", t.id), { ...(text ? { reply: text.slice(0, 1000) } : {}), status: close ? "closed" : "open" });
      if (text && user && profile) notify(t.uid, { uid: user.uid, username: "GrAte Apex Support" }, "support", t.id);
      setReply((r) => ({ ...r, [t.id]: "" })); load();
    } catch (e: any) { setErr(`Couldn't update (${e?.code ?? "error"}).`); }
  };

  const card = { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 } as const;
  const h = { color: COLORS.text, fontSize: 18, fontWeight: "800" as const, marginTop: 18, marginBottom: 10 };
  const chip = (id: string, label: string) => (
    <TouchableOpacity key={id} onPress={() => setCat(id)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: cat === id ? COLORS.primary : COLORS.border, backgroundColor: cat === id ? COLORS.primary : COLORS.card, marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color: cat === id ? COLORS.onPrimary : COLORS.text, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Background><Column>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: "800", flex: 1 }}>Help & support</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 10 }} accessibilityLabel="Close"><Icon name="close" size={26} color={COLORS.text} /></TouchableOpacity>
          </View>
          <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Quick answers first. If you're still stuck, message us.</Text>

          <Text style={h}>Common questions</Text>
          {FAQ.map(([q, a], i) => (
            <TouchableOpacity key={i} onPress={() => setOpenQ(openQ === i ? null : i)} activeOpacity={0.85} style={card}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: COLORS.text, fontWeight: "700", flex: 1, lineHeight: 21 }}>{q}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 18 }}>{openQ === i ? "−" : "+"}</Text>
              </View>
              {openQ === i && <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 21 }}>{a}</Text>}
            </TouchableOpacity>
          ))}

          <Text style={h}>Message us</Text>
          <View style={card}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{CATS.map(([id, label]) => chip(id, label))}</View>
            <TextInput value={msg} onChangeText={(t) => { setMsg(t); setSent(false); }} multiline maxLength={1000} placeholder="Tell us what happened…" placeholderTextColor={COLORS.muted}
              style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 12, minHeight: 100, textAlignVertical: "top" }} />
            {!!err && <Text style={{ color: COLORS.danger, marginTop: 8 }}>{err}</Text>}
            {sent && <Text style={{ color: "#22c55e", marginTop: 8, fontWeight: "700" }}><Em n="check" /> Sent! We'll reply here. You'll get a notification.</Text>}
            <TouchableOpacity onPress={send} disabled={busy || msg.trim().length < 5} style={{ marginTop: 10, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center", opacity: busy || msg.trim().length < 5 ? 0.5 : 1 }}>
              {busy ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Send message</Text>}
            </TouchableOpacity>
          </View>

          {(!!WHATSAPP || !!EMAIL) && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              {!!WHATSAPP && <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}`)} style={{ flex: 1, ...card, alignItems: "center", marginBottom: 0 }}><Text style={{ color: COLORS.text, fontWeight: "800" }}><Em n="chat" /> WhatsApp</Text></TouchableOpacity>}
              {!!EMAIL && <TouchableOpacity onPress={() => Linking.openURL(`mailto:${EMAIL}`)} style={{ flex: 1, ...card, alignItems: "center", marginBottom: 0 }}><Text style={{ color: COLORS.text, fontWeight: "800" }}><Em n="mail" /> Email</Text></TouchableOpacity>}
            </View>
          )}

          {mine.length > 0 && <Text style={h}>Your messages</Text>}
          {mine.map((t) => (
            <View key={t.id} style={card}>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>{CATS.find((c) => c[0] === t.category)?.[1]} · {timeAgo(t.createdAt)} · {t.status === "closed" ? wi("✅ Answered") : wi("⏳ Open")}</Text>
              <Text style={{ color: COLORS.text, marginTop: 4, lineHeight: 21 }}>{t.message}</Text>
              {!!t.reply && <View style={{ marginTop: 8, backgroundColor: COLORS.bg, borderRadius: 12, padding: 10 }}><Text style={{ color: COLORS.accent, fontWeight: "800", fontSize: 12 }}>Support replied</Text><Text style={{ color: COLORS.text, marginTop: 2, lineHeight: 21 }}>{t.reply}</Text></View>}
            </View>
          ))}

          {isAdmin && (
            <>
              <Text style={h}>Inbox (admin) · {inbox.length} open</Text>
              {inbox.length === 0 && <Text style={{ color: COLORS.muted }}>All caught up <Em n="sparkle" /></Text>}
              {inbox.map((t) => (
                <View key={t.id} style={card}>
                  <Text style={{ color: COLORS.muted, fontSize: 12 }}>@{t.username} · {CATS.find((c) => c[0] === t.category)?.[1]} · {timeAgo(t.createdAt)}</Text>
                  <Text style={{ color: COLORS.text, marginTop: 4, lineHeight: 21 }}>{t.message}</Text>
                  {!!t.reply && <Text style={{ color: COLORS.accent, marginTop: 6 }}>Your reply: {t.reply}</Text>}
                  <TextInput value={reply[t.id] ?? ""} onChangeText={(v) => setReply((r) => ({ ...r, [t.id]: v }))} placeholder="Write a reply…" placeholderTextColor={COLORS.muted} multiline
                    style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 10, marginTop: 8, minHeight: 60, textAlignVertical: "top" }} />
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                    <TouchableOpacity onPress={() => answer(t, true)} style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 11, alignItems: "center" }}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>{(reply[t.id] ?? "").trim() ? "Reply & close" : "Close"}</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </Column></Background>
    </Modal>
  );
}
