import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Modal, Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { addDoc, collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Text, TextInput } from "../Text";
import { useAuth } from "../auth";
import { useColors } from "../theme";
import { MOMO, PLANS, PlanId } from "../plans";
import { decideMomo, startPaystack, usePremium } from "../premium";
import Background from "../Background";
import { Column } from "../ui";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

type Req = { id: string; plan: PlanId; reference: string; phone: string; status: string; username?: string; uid?: string; createdAt?: number; note?: string };
const fmt = (ms: number) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function PremiumScreen({ visible, onClose, isAdmin }: { visible: boolean; onClose: () => void; isAdmin: boolean }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const { premium, until } = usePremium();
  const [plan, setPlan] = useState<PlanId>("sem1");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [momo, setMomo] = useState(false);
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [mine, setMine] = useState<Req[]>([]);
  const [pending, setPending] = useState<Req[]>([]);

  const loadMine = useCallback(async () => {
    if (!user) return;
    try {
      const s = await getDocs(query(collection(db, "momoRequests"), where("uid", "==", user.uid), limit(20)));
      setMine(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)));
    } catch { /* ignore */ }
  }, [user]);
  const loadPending = useCallback(async () => {
    try {
      const s = await getDocs(query(collection(db, "momoRequests"), where("status", "==", "pending"), limit(50)));
      setPending(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)));
    } catch (e: any) { setErr(`Couldn't load requests (${e?.code ?? "error"}).`); }
  }, []);
  useEffect(() => { if (visible) { setErr(""); loadMine(); if (isAdmin) loadPending(); } }, [visible, isAdmin, loadMine, loadPending]);

  const pay = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await startPaystack(plan);
      if (Platform.OS === "web") window.location.href = r.url; else await Linking.openURL(r.url);
    } catch (e: any) { setErr(e?.message ?? "Couldn't start the payment."); }
    finally { setBusy(false); }
  };

  const submitMomo = async () => {
    if (!user || !profile) return;
    const r = ref.trim(), p = phone.replace(/\s+/g, "");
    if (r.length < 4) return setErr("Enter the transaction ID from your MoMo message.");
    if (p.length < 8) return setErr("Enter the number you paid from.");
    setErr(""); setBusy(true);
    try {
      await addDoc(collection(db, "momoRequests"), { uid: user.uid, username: profile.username, plan, reference: r, phone: p, status: "pending", createdAt: Date.now() });
      setRef(""); setPhone(""); setMomo(false); await loadMine();
    } catch (e: any) { setErr(`Couldn't send it (${e?.code ?? "error"}).`); }
    finally { setBusy(false); }
  };

  const decide = async (id: string, ok: boolean) => {
    setErr("");
    try { await decideMomo(id, ok); await loadPending(); }
    catch (e: any) { setErr(e?.message ?? "Couldn't update."); }
  };

  const card = { backgroundColor: COLORS.light ? "#ffffff" : "rgba(255,255,255,0.07)", borderColor: COLORS.border, borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12 } as const;
  const h2 = { color: COLORS.text, fontSize: 18, fontWeight: "800" as const, marginTop: 18, marginBottom: 10 };
  const planBtn = (id: PlanId) => (
    <TouchableOpacity key={id} onPress={() => setPlan(id)} style={{ flex: 1, padding: 14, borderRadius: 18, borderWidth: 2, borderColor: plan === id ? COLORS.accent : COLORS.border, backgroundColor: COLORS.card, marginRight: id === "sem1" ? 10 : 0 }}>
      <Text style={{ color: COLORS.muted, fontSize: 13 }}>{PLANS[id].label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "800", marginTop: 2 }}>GHS {PLANS[id].ghs}</Text>
      {id === "sem2" && <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "700", marginTop: 2 }}>Save GHS {PLANS.sem1.ghs * 2 - PLANS.sem2.ghs}</Text>}
    </TouchableOpacity>
  );
  const status = (s: string) => (s === "approved" ? "✅ Approved" : s === "rejected" ? "❌ Rejected" : "⏳ Waiting for approval");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Background><Column max={640}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={onClose} style={{ marginBottom: 14 }}><Text style={{ color: COLORS.accent, fontWeight: "700" }}><Em n="close" /> Close</Text></TouchableOpacity>
          <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: "800" }}><Em n="star" /> Premium</Text>

          <View style={[card, { marginTop: 14, borderColor: premium ? COLORS.accent : COLORS.border }]}>
            <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 16 }}>{premium ? "You're Premium" : "Not subscribed"}</Text>
            <Text style={{ color: COLORS.muted, marginTop: 4 }}>{premium ? `Active until ${fmt(until)}. Paying again adds time on top.` : "Pick a plan below. Payments add time to your subscription."}</Text>
          </View>

          <Text style={h2}>Choose a plan</Text>
          <View style={{ flexDirection: "row" }}>{planBtn("sem1")}{planBtn("sem2")}</View>

          <Text style={h2}>Pay</Text>
          <TouchableOpacity onPress={pay} disabled={busy} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center", opacity: busy ? 0.6 : 1 }}>
            {busy ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 16 }}>Pay GHS {PLANS[plan].ghs} with MoMo or card</Text>}
          </TouchableOpacity>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 8, textAlign: "center" }}>Secure checkout by Paystack. Premium switches on automatically.</Text>

          <TouchableOpacity onPress={() => setMomo(!momo)} style={{ marginTop: 18, paddingVertical: 14, alignItems: "center", borderRadius: 999, borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ color: COLORS.text, fontWeight: "700" }}>{momo ? "Hide manual MoMo" : "Or pay by MoMo yourself and tell us"}</Text>
          </TouchableOpacity>

          {momo && (
            <View style={[card, { marginTop: 12 }]}>
              {MOMO.number ? (
                <>
                  <Text style={{ color: COLORS.text, lineHeight: 22 }}>1. Send <Text style={{ fontWeight: "800" }}>GHS {PLANS[plan].ghs}</Text> by {MOMO.network} to:</Text>
                  <Text style={{ color: COLORS.accent, fontSize: 22, fontWeight: "800", marginVertical: 6 }} selectable>{MOMO.number}</Text>
                  {!!MOMO.name && <Text style={{ color: COLORS.muted, marginBottom: 8 }}>Name: {MOMO.name}</Text>}
                  <Text style={{ color: COLORS.text, lineHeight: 22 }}>2. Copy the transaction ID from the MoMo confirmation message and enter it here:</Text>
                  <TextInput value={ref} onChangeText={setRef} placeholder="Transaction ID" placeholderTextColor={COLORS.muted} autoCapitalize="none" maxLength={40}
                    style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 10, fontSize: 15 }} />
                  <TextInput value={phone} onChangeText={setPhone} placeholder="Number you paid from" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" maxLength={15}
                    style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 10, fontSize: 15 }} />
                  <TouchableOpacity onPress={submitMomo} disabled={busy} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 12, opacity: busy ? 0.6 : 1 }}>
                    <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>I've paid, send for approval</Text>
                  </TouchableOpacity>
                  <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>Approval is done by hand, so it can take a little while.</Text>
                </>
              ) : <Text style={{ color: COLORS.muted }}>Manual MoMo isn't set up yet.</Text>}
            </View>
          )}

          {!!err && <Text style={{ color: COLORS.danger, marginTop: 12 }}>{err}</Text>}

          {mine.length > 0 && (<>
            <Text style={h2}>Your MoMo payments</Text>
            {mine.map((m) => (
              <View key={m.id} style={card}>
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>{PLANS[m.plan]?.label} · GHS {PLANS[m.plan]?.ghs}</Text>
                <Text style={{ color: COLORS.muted, marginTop: 2 }}>Ref {m.reference} · {m.createdAt ? fmt(m.createdAt) : ""}</Text>
                <Text style={{ color: COLORS.text, marginTop: 6 }}>{wi(status(m.status))}{m.status === "rejected" && m.note ? ` (${m.note})` : ""}</Text>
              </View>
            ))}
          </>)}

          {isAdmin && (<>
            <Text style={h2}>Admin: payments to approve ({pending.length})</Text>
            {pending.length === 0 && <Text style={{ color: COLORS.muted }}>Nothing waiting.</Text>}
            {pending.map((m) => (
              <View key={m.id} style={card}>
                <Text style={{ color: COLORS.text, fontWeight: "800" }}>@{m.username} · {PLANS[m.plan]?.label} · GHS {PLANS[m.plan]?.ghs}</Text>
                <Text style={{ color: COLORS.muted, marginTop: 4 }} selectable>Transaction ID: {m.reference}</Text>
                <Text style={{ color: COLORS.muted }} selectable>Paid from: {m.phone}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>Check it against your MoMo messages before approving.</Text>
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                  <TouchableOpacity onPress={() => decide(m.id, true)} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 }}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Approve</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => decide(m.id, false)} style={{ borderColor: COLORS.danger, borderWidth: 1, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 }}><Text style={{ color: COLORS.danger, fontWeight: "700" }}>Reject</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </>)}
        </ScrollView>
      </Column></Background>
    </Modal>
  );
}
