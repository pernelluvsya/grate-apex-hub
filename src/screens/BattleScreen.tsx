import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "../Text";
import { useAuth } from "../auth";
import { useProgress } from "../progress";
import { useColors } from "../theme";
import { COURSES, accessibleCourses } from "../data/catalog";
import { Avatar } from "../MediaUI";
import { getUserInfo } from "../engage";
import { fetchEdges, searchUsers, UserHit } from "../social";
import { confirmAsk } from "../confirm";
import Icon from "../Icon";
import {
  Battle, STAKES, MIN_STAKE, MAX_STAKE, MIN_N, MAX_N, LOBBY_TTL, PRESENCE_TTL, abortBattle, joinBattle, leaveBattle, acceptBattle, advanceBattle, answerBattle, cancelBattle, createBattle, declineBattle,
  serverNow, settleBattle, syncClock, watchBattle, watchLedger, watchMyBattles,
} from "../battle";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

type Ledger = { net: number; wins?: number; losses?: number; draws?: number; played?: number };
const courseLabel = (id: string) => { if (id === "mixed") return "🔀 Mixed"; const c = COURSES.find((x) => x.id === id); return c ? `${c.icon} ${c.name}` : id; };

export default function BattleScreen({ onClose, target }: { onClose: () => void; target?: UserHit | null }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const { progress } = useProgress();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [ledger, setLedger] = useState<Ledger>({ net: 0 });
  const [room, setRoom] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [newOpen, setNewOpen] = useState(!!target);
  const me = user!.uid;

  useEffect(() => { syncClock(); }, []);
  useEffect(() => watchMyBattles(me, setBattles), [me]);
  useEffect(() => watchLedger(me, setLedger), [me]);

  // battles everyone walked away from: close them so the stakes aren't stuck
  useEffect(() => {
    battles.filter((b) => (b.status === "live" && b.startAt && serverNow() > b.startAt + b.N * (b.T * 1000 + 2500) + 120000)
      || (b.status === "lobby" && b.acceptedAt && serverNow() > b.acceptedAt + LOBBY_TTL)).forEach((b) => settleBattle(b.id).catch(() => {}));
  }, [battles.length]);

  const opp = (b: Battle) => b.players.find((p) => p !== me)!;
  const fresh = (b: Battle) => serverNow() - b.createdAt < 24 * 3600 * 1000;
  const incoming = battles.filter((b) => b.status === "invited" && b.players[1] === me && fresh(b));
  const sent = battles.filter((b) => b.status === "invited" && b.challenger === me && fresh(b));
  const live = battles.filter((b) => b.status === "live");
  const lobby = battles.filter((b) => b.status === "lobby" && serverNow() - (b.acceptedAt ?? 0) < LOBBY_TTL);
  const past = battles.filter((b) => b.status === "done").slice(0, 8);

  const act = async (key: string, fn: () => Promise<any>, after?: () => void) => {
    setBusy(key); setErr("");
    try { await fn(); after?.(); } catch (e: any) { setErr(e?.message || "Something went wrong."); }
    setBusy("");
  };

  if (room) return <Room id={room} meUid={me} onExit={() => setRoom(null)} onRematch={async (b) => { setRoom(null); await act("re", () => createBattle(opp(b), b.stake, b.course, b.N)); }} />;

  const card = { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 } as const;
  const pill = (bg: string, outline?: boolean) => ({ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: outline ? "transparent" : bg, borderWidth: 1, borderColor: outline ? COLORS.border : bg });
  const Row = ({ b, children }: { b: Battle; children: React.ReactNode }) => (
    <View style={[card, { flexDirection: "row", alignItems: "center" }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.text, fontWeight: "800" }}>@{b.names[opp(b)]}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{wi(courseLabel(b.course))} · {b.N} questions · ⚡ {b.stake} XP each</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: "800" }}><Em n="swords" /> XP Battles</Text>
          <Text style={{ color: COLORS.muted, marginTop: 4 }}>You pick the questions and the XP. Both of you join the room, then it's live. Winner takes the pot.</Text>
        </View>
        <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={{ padding: 10 }}><Icon name="close" size={26} color={COLORS.text} /></TouchableOpacity>
      </View>

      <View style={[card, { flexDirection: "row", justifyContent: "space-between" }]}>
        <View><Text style={{ color: COLORS.muted, fontSize: 12 }}>YOUR XP</Text><Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "800" }}>{Math.round(progress.xp)}</Text></View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>RECORD</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}>{ledger.wins ?? 0}W · {ledger.losses ?? 0}L · {ledger.draws ?? 0}D</Text>
          <Text style={{ color: ledger.net >= 0 ? "#22c55e" : COLORS.danger, fontSize: 13, fontWeight: "700" }}>{ledger.net >= 0 ? "+" : ""}{ledger.net} XP from battles</Text>
        </View>
      </View>

      {!!err && <Text style={{ color: COLORS.danger, marginBottom: 10 }}>{err}</Text>}

      {newOpen ? (
        <NewChallenge target={target} xp={progress.xp} onCancel={() => setNewOpen(false)}
          onSend={(u, stake, course, n) => act("new", () => createBattle(u.uid, stake, course, n), () => setNewOpen(false))} sending={busy === "new"} />
      ) : (
        <TouchableOpacity onPress={() => setNewOpen(true)} style={[pill(COLORS.primary), { alignItems: "center", paddingVertical: 14, marginBottom: 16 }]}>
          <Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 16 }}>＋ Challenge someone</Text>
        </TouchableOpacity>
      )}

      {incoming.length > 0 && <Text style={heading(COLORS)}>Challenges for you</Text>}
      {incoming.map((b) => (
        <Row key={b.id} b={b}>
          <TouchableOpacity onPress={() => act(b.id, () => declineBattle(b.id))} style={[pill("", true), { marginRight: 8 }]}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Decline</Text></TouchableOpacity>
          <TouchableOpacity disabled={busy === b.id} onPress={() => act(b.id, () => acceptBattle(b.id), () => setRoom(b.id))} style={pill(COLORS.primary)}>
            {busy === b.id ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Accept</Text>}
          </TouchableOpacity>
        </Row>
      ))}
      {lobby.length > 0 && <Text style={heading(COLORS)}>Battle rooms (waiting to start)</Text>}
      {lobby.map((b) => (
        <Row key={b.id} b={b}><TouchableOpacity onPress={() => setRoom(b.id)} style={pill(COLORS.primary)}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Enter room</Text></TouchableOpacity></Row>
      ))}
      {live.length > 0 && <Text style={heading(COLORS)}>Live now</Text>}
      {live.map((b) => (
        <Row key={b.id} b={b}><TouchableOpacity onPress={() => setRoom(b.id)} style={pill("#22c55e")}><Text style={{ color: "#fff", fontWeight: "800" }}>Join</Text></TouchableOpacity></Row>
      ))}
      {sent.length > 0 && <Text style={heading(COLORS)}>Waiting for a reply</Text>}
      {sent.map((b) => (
        <Row key={b.id} b={b}><TouchableOpacity onPress={() => act(b.id, () => cancelBattle(b.id))} style={pill("", true)}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Cancel</Text></TouchableOpacity></Row>
      ))}
      {past.length > 0 && <Text style={heading(COLORS)}>Recent battles</Text>}
      {past.map((b) => {
        const won = b.winner === me, draw = !b.winner;
        return (
          <TouchableOpacity key={b.id} onPress={() => setRoom(b.id)}>
            <Row b={b}>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: draw ? COLORS.muted : won ? "#22c55e" : COLORS.danger, fontWeight: "800" }}>{draw ? "Draw" : won ? `Won +${b.stake}` : `Lost −${b.stake}`}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12 }}>{b.scores[me] ?? 0} – {b.scores[opp(b)] ?? 0}</Text>
              </View>
            </Row>
          </TouchableOpacity>
        );
      })}
      {!incoming.length && !lobby.length && !live.length && !sent.length && !past.length && <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 20 }}>No battles yet. Challenge a friend and stake some XP!</Text>}
    </ScrollView>
  );
}
const heading = (C: any) => ({ color: C.text, fontSize: 16, fontWeight: "800" as const, marginTop: 10, marginBottom: 8 });

// ---------------- start a new challenge ----------------
function NewChallenge({ target, xp, onCancel, onSend, sending }: { target?: UserHit | null; xp: number; onCancel: () => void; onSend: (u: UserHit, stake: number, course: string, n: number) => void; sending: boolean }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const [who, setWho] = useState<UserHit | null>(target ?? null);
  const [friends, setFriends] = useState<UserHit[]>([]);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<UserHit[]>([]);
  const [stakeTxt, setStakeTxt] = useState(String(STAKES.find((s) => s <= xp) ?? MIN_STAKE));
  const [nTxt, setNTxt] = useState("7");
  const stake = parseInt(stakeTxt, 10) || 0, n = parseInt(nTxt, 10) || 0;
  const maxStake = Math.min(MAX_STAKE, Math.floor(xp));
  const problem = stake < MIN_STAKE ? `Stake at least ${MIN_STAKE} XP.` : stake > maxStake ? (xp < stake && stake <= MAX_STAKE ? `You only have ${Math.floor(xp)} XP.` : `Stake at most ${MAX_STAKE} XP.`) : n < MIN_N || n > MAX_N ? `Choose ${MIN_N}–${MAX_N} questions.` : "";
  const [course, setCourse] = useState("mixed");
  const list = accessibleCourses(profile?.hall, profile?.semester);
  const courses = list.length ? list : COURSES;

  useEffect(() => { if (user) fetchEdges(user.uid, "following").then(setFriends).catch(() => {}); }, [user?.uid]);
  useEffect(() => { const t = setTimeout(() => searchUsers(q).then((h) => setHits(h.filter((x) => x.uid !== user?.uid))).catch(() => {}), 300); return () => clearTimeout(t); }, [q]);

  const chip = (label: string, on: boolean, press: () => void, off = false) => (
    <TouchableOpacity key={label} onPress={press} disabled={off} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: on ? COLORS.primary : COLORS.border, backgroundColor: on ? COLORS.primary : COLORS.card, opacity: off ? 0.4 : 1, marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color: on ? COLORS.onPrimary : COLORS.text, fontWeight: "700" }}>{wi(label)}</Text>
    </TouchableOpacity>
  );
  const shown = q.trim().length >= 2 ? hits : friends;
  return (
    <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.primary, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 }}>
      <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 17, marginBottom: 10 }}>New challenge</Text>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>WHO</Text>
      {who ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 16, flex: 1 }}>@{who.username}</Text>
          {!target && <TouchableOpacity onPress={() => setWho(null)}><Text style={{ color: COLORS.accent, fontWeight: "700" }}>Change</Text></TouchableOpacity>}
        </View>
      ) : (
        <View style={{ marginBottom: 12 }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Search a username…" placeholderTextColor={COLORS.muted} autoCapitalize="none"
            style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 10, marginBottom: 8 }} />
          {q.trim().length < 2 && friends.length > 0 && <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 4 }}>People you follow</Text>}
          {shown.slice(0, 8).map((u) => (
            <TouchableOpacity key={u.uid} onPress={() => setWho(u)} style={{ paddingVertical: 8 }}><Text style={{ color: COLORS.text, fontWeight: "700" }}>@{u.username}</Text></TouchableOpacity>
          ))}
          {!shown.length && <Text style={{ color: COLORS.muted }}>{q.trim().length >= 2 ? "No one found." : "Follow people in Compete → Find, or search above."}</Text>}
        </View>
      )}
      <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>STAKE (EACH)</Text>
      <TextInput value={stakeTxt} onChangeText={(t) => setStakeTxt(t.replace(/[^0-9]/g, "").slice(0, 4))} keyboardType="number-pad" placeholder="XP to stake" placeholderTextColor={COLORS.muted}
        style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 10, marginBottom: 8, fontSize: 16, fontWeight: "700" }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{STAKES.map((s) => chip(`⚡ ${s}`, stake === s, () => setStakeTxt(String(s)), s > xp))}</View>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 4 }}>NUMBER OF QUESTIONS ({MIN_N}–{MAX_N})</Text>
      <TextInput value={nTxt} onChangeText={(t) => setNTxt(t.replace(/[^0-9]/g, "").slice(0, 2))} keyboardType="number-pad" placeholder="How many questions" placeholderTextColor={COLORS.muted}
        style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 10, marginBottom: 8, fontSize: 16, fontWeight: "700" }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{[5, 7, 10, 15].map((k) => chip(`${k}`, n === k, () => setNTxt(String(k))))}</View>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 4 }}>QUESTIONS FROM</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{chip("🔀 Mixed", course === "mixed", () => setCourse("mixed"))}{courses.map((c) => chip(`${c.icon} ${c.name}`, course === c.id, () => setCourse(c.id)))}</View>
      <Text style={{ color: COLORS.muted, fontSize: 13, marginVertical: 6 }}>
        Winner takes {stake * 2} XP (you risk {stake}). XP is only taken once they accept, and the battle starts when you are both in the room. A draw, or a battle called off before it starts, gives everyone their stake back.
      </Text>
      {!!problem && <Text style={{ color: COLORS.danger, marginBottom: 6, fontWeight: "600" }}>{problem}</Text>}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={onCancel} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}><Text style={{ color: COLORS.text, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity disabled={!who || sending || !!problem} onPress={() => who && onSend(who, stake, course, n)} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary, opacity: !who || sending || !!problem ? 0.5 : 1 }}>
          {sending ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Send challenge</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------- the live room ----------------
function Room({ id, meUid, onExit, onRematch }: { id: string; meUid: string; onExit: () => void; onRematch: (b: Battle) => void }) {
  const COLORS = useColors();
  const [b, setB] = useState<Battle | null | undefined>(undefined);
  const [, setTick] = useState(0);
  const [mine, setMine] = useState<Record<number, { pick: number; ok: boolean; pts: number; a: number; e: string }>>({});
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const adv = useRef<{ qi: number; at: number }>({ qi: -1, at: 0 });
  const settled = useRef(false);

  useEffect(() => { syncClock(); return watchBattle(id, setB); }, [id]);
  // In the lobby: check in now and every 8 seconds. The server starts the battle once both players are in.
  const lobby = b?.status === "lobby";
  useEffect(() => {
    if (!lobby) return;
    const ping = () => joinBattle(id).catch((e) => setErr(e?.message || ""));
    ping(); const t = setInterval(ping, 8000);
    return () => { clearInterval(t); leaveBattle(id); };
  }, [lobby, id]);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 250); return () => clearInterval(t); }, []);

  const qi = b ? Math.max(0, b.qStart.length - 1) : 0;
  const start = b?.qStart[qi] ?? 0;
  const now = serverNow();
  const revealed = !!b?.reveal?.[qi];
  const oppUid = b?.players.find((p) => p !== meUid) ?? "";

  // time ran out on this question: ask the server to move on (both phones try; it's safe)
  useEffect(() => {
    if (!b || b.status !== "live" || revealed || !start) return;
    if (now >= start + b.T * 1000 + 400 && (adv.current.qi !== qi || now - adv.current.at > 1500)) {
      adv.current = { qi, at: now }; advanceBattle(id, qi).catch(() => {});
    }
  });
  // after the last question closes, pay out
  useEffect(() => {
    if (b && b.status === "live" && b.reveal?.[b.N - 1] && !settled.current) { settled.current = true; settleBattle(id).catch(() => { settled.current = false; }); }
  });

  if (b === undefined) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.accent} /></View>;
  if (b === null) return <Center><Text style={{ color: COLORS.text }}>Battle not found.</Text><Btn label="Back" onPress={onExit} /></Center>;
  const myName = b.names[meUid], oppName = b.names[oppUid];
  const q = b.questions[qi];

  const Score = () => (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 14 }}>
      <View style={{ flex: 1 }}><Text style={{ color: COLORS.muted, fontSize: 12 }}>@{myName} (you)</Text><Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "800" }}>{b.scores[meUid] ?? 0}</Text></View>
      <View style={{ alignItems: "center" }}><Text style={{ color: COLORS.accent, fontWeight: "800" }}>⚡ {b.stake * 2}</Text><Text style={{ color: COLORS.muted, fontSize: 11 }}>pot</Text></View>
      <View style={{ flex: 1, alignItems: "flex-end" }}><Text style={{ color: COLORS.muted, fontSize: 12 }}>@{oppName}</Text><Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "800" }}>{b.scores[oppUid] ?? 0}</Text></View>
    </View>
  );

  // ---- finished ----
  if (b.status === "done") {
    const won = b.winner === meUid, draw = !b.winner;
    return (
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
        <Score />
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text style={{ fontSize: 56 }}>{draw ? wi("🤝") : won ? wi("🏆") : wi("😤")}</Text>
          <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "800", marginTop: 6 }}>{draw ? "It's a draw" : won ? "You won!" : `@${oppName} won`}</Text>
          <Text style={{ color: draw ? COLORS.muted : won ? "#22c55e" : COLORS.danger, fontSize: 20, fontWeight: "800", marginTop: 6 }}>
            {draw ? "Stakes returned" : won ? `+${b.stake} XP` : `−${b.stake} XP`}
          </Text>
        </View>
        {b.questions.map((x, i) => {
          const a = b.ans?.[meUid]?.[i], o = b.ans?.[oppUid]?.[i], r = b.reveal?.[i];
          return (
            <View key={i} style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 }}>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>Q{i + 1} · you {a ? (a.ok ? wi(`✓ +${a.pts}`) : wi("✗")) : "—"} · @{oppName} {o ? (o.ok ? wi(`✓ +${o.pts}`) : wi("✗")) : "—"}</Text>
              <Text style={{ color: COLORS.text, marginTop: 4, lineHeight: 20 }}>{x.q}</Text>
              {r && <Text style={{ color: "#22c55e", marginTop: 6, fontWeight: "700" }}>{String.fromCharCode(65 + r.a)}. {x.o[r.a]}</Text>}
              {!!r?.e && <Text style={{ color: COLORS.muted, marginTop: 4, fontSize: 13, lineHeight: 18 }}>{r.e}</Text>}
            </View>
          );
        })}
        <Btn label={`Rematch (${b.stake})`} onPress={() => onRematch(b)} />
        <Btn label="Back" onPress={onExit} ghost />
      </ScrollView>
    );
  }
  if (b.status === "lobby") {
    const here = (u: string) => serverNow() - (b.present?.[u] ?? 0) < PRESENCE_TTL;
    const Seat = ({ u, label }: { u: string; label: string }) => (
      <View style={{ flex: 1, alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 2, borderColor: here(u) ? "#22c55e" : COLORS.border, backgroundColor: COLORS.card }}>
        <Text style={{ color: COLORS.text, fontWeight: "800" }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: here(u) ? "#22c55e" : COLORS.muted, fontWeight: "700", marginTop: 6 }}>{here(u) ? "● In the room" : "○ Not here yet"}</Text>
      </View>
    );
    return (
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
        <TouchableOpacity onPress={onExit} style={{ marginBottom: 10 }}><Text style={{ color: COLORS.accent, fontWeight: "700" }}>‹ Leave room</Text></TouchableOpacity>
        <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "800" }}><Em n="swords" /> Battle room</Text>
        <Text style={{ color: COLORS.muted, marginTop: 4, marginBottom: 16 }}>{b.N} questions · ⚡ {b.stake} XP each · winner takes {b.stake * 2}</Text>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
          <Seat u={meUid} label={`@${myName} (you)`} /><Seat u={oppUid} label={`@${oppName}`} />
        </View>
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={{ color: COLORS.text, fontWeight: "700", marginTop: 10, textAlign: "center" }}>{here(oppUid) ? "Starting…" : `Waiting for @${oppName} to enter the room…`}</Text>
          <Text style={{ color: COLORS.muted, marginTop: 4, textAlign: "center", fontSize: 13 }}>The battle starts as soon as you are both here. Stay on this screen.</Text>
        </View>
        {!!err && <Text style={{ color: COLORS.danger, textAlign: "center" }}>{err}</Text>}
        <Btn label="Call off the battle (XP returned)" ghost onPress={async () => { try { await abortBattle(id); onExit(); } catch (e: any) { setErr(e?.message || "Couldn't call it off."); } }} />
      </ScrollView>
    );
  }
  if (b.status !== "live") return <Center><Text style={{ color: COLORS.text, fontSize: 18 }}>This challenge is {b.status}.</Text><Btn label="Back" onPress={onExit} /></Center>;

  // ---- live ----
  const myAns = b.ans?.[meUid]?.[qi], oppAns = b.ans?.[oppUid]?.[qi];
  const local = mine[qi];
  const waiting = now < start;
  const secLeft = Math.max(0, Math.ceil((start + b.T * 1000 - now) / 1000));
  const frac = Math.max(0, Math.min(1, (start + b.T * 1000 - now) / (b.T * 1000)));
  const pick = async (i: number) => {
    if (sending || myAns || local || waiting || revealed) return;
    setSending(true); setErr("");
    try { const r = await answerBattle(id, qi, i); setMine((m) => ({ ...m, [qi]: { pick: i, ...r } })); }
    catch (e: any) { setErr(e?.message || "Couldn't send that answer."); }
    setSending(false);
  };
  const reveal = b.reveal?.[qi];
  const correct = reveal?.a ?? local?.a;
  const answered = !!(myAns || local);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
      <TouchableOpacity onPress={onExit} style={{ marginBottom: 10 }}><Text style={{ color: COLORS.accent, fontWeight: "700" }}>‹ Leave room (the battle keeps going)</Text></TouchableOpacity>
      <Score />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ color: COLORS.muted, fontWeight: "700" }}>Question {qi + 1} of {b.N}</Text>
        <Text style={{ color: !waiting && secLeft <= 5 ? COLORS.danger : COLORS.text, fontWeight: "800" }}>{waiting ? "Get ready…" : revealed ? "Next up…" : `${secLeft}s`}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: COLORS.border, overflow: "hidden", marginBottom: 14 }}>
        <View style={{ width: `${waiting || revealed ? 0 : frac * 100}%`, height: "100%", backgroundColor: frac < 0.3 ? COLORS.danger : COLORS.accent }} />
      </View>
      {waiting ? (
        <Center><Text style={{ color: COLORS.text, fontSize: 56, fontWeight: "800" }}>{Math.max(1, Math.ceil((start - now) / 1000))}</Text><Text style={{ color: COLORS.muted }}>{qi === 0 ? "Battle starts" : "Next question"}…</Text></Center>
      ) : (
        <View>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700", lineHeight: 26, marginBottom: 14 }}>{q.q}</Text>
          {q.o.map((o, i) => {
            const chosen = local?.pick === i;
            const isCorrect = correct === i;
            const bad = chosen && correct !== undefined && !isCorrect;
            const border = isCorrect && correct !== undefined ? "#22c55e" : bad ? COLORS.danger : chosen ? COLORS.primary : COLORS.border;
            return (
              <TouchableOpacity key={i} disabled={answered || revealed || sending} onPress={() => pick(i)} activeOpacity={0.8}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: isCorrect && correct !== undefined ? "rgba(34,197,94,0.15)" : bad ? "rgba(239,68,68,0.15)" : COLORS.card, borderColor: border, borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 10, opacity: sending && !chosen ? 0.6 : 1 }}>
                <Text style={{ color: COLORS.muted, fontWeight: "800", width: 26 }}>{String.fromCharCode(65 + i)}</Text>
                <Text style={{ color: COLORS.text, flex: 1, lineHeight: 21 }}>{o}</Text>
              </TouchableOpacity>
            );
          })}
          {!!err && <Text style={{ color: COLORS.danger, marginBottom: 8 }}>{err}</Text>}
          {answered && !revealed && (
            <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 4 }}>
              {local ? (local.ok ? wi(`✓ Correct! +${local.pts}`) : "✗ Not quite") : "Answer locked in"} · {oppAns ? `@${oppName} has answered` : `waiting for @${oppName}…`}
            </Text>
          )}
          {!answered && !revealed && oppAns && <Text style={{ color: COLORS.accent, textAlign: "center", fontWeight: "700" }}>@{oppName} has answered, hurry!</Text>}
          {revealed && (
            <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 4 }}>
              <Text style={{ color: COLORS.text, fontWeight: "800" }}>
                You {myAns ? (myAns.ok ? wi(`✓ +${myAns.pts}`) : "✗ +0") : "— no answer"}   ·   @{oppName} {oppAns ? (oppAns.ok ? wi(`✓ +${oppAns.pts}`) : "✗ +0") : "— no answer"}
              </Text>
              {!!reveal?.e && <Text style={{ color: COLORS.muted, marginTop: 6, lineHeight: 19 }}>{reveal.e}</Text>}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Center({ children }: { children: React.ReactNode }) { return <View style={{ alignItems: "center", justifyContent: "center", padding: 30 }}>{children}</View>; }
function Btn({ label, onPress, ghost }: { label: string; onPress: () => void; ghost?: boolean }) {
  const COLORS = useColors();
  return (
    <TouchableOpacity onPress={onPress} style={{ marginTop: 10, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: ghost ? "transparent" : COLORS.primary, borderWidth: 1, borderColor: ghost ? COLORS.border : COLORS.primary }}>
      <Text style={{ color: ghost ? COLORS.text : COLORS.onPrimary, fontWeight: "800", fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );
}
