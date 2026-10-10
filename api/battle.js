// Live XP battles. The server is the referee: it picks the questions, keeps the answer
// key, grades answers, holds the stakes ("escrow") and pays the winner. Players only
// read the battle document (live) and call this function to act.
const { admin, init, uidFrom, allowedCourses, sendPush } = require("./_lib");

const COURSES = {
  biochemistry: require("../src/data/courses/biochemistry.json"),
  physiology: require("../src/data/courses/physiology.json"),
  anatomy: require("../src/data/courses/anatomy.json"),
  behavioural: require("../src/data/courses/behavioural.json"),
  entomology: require("../src/data/courses/entomology.json"),
  biolchem: require("../src/data/courses/biolchem.json"),
  medgen: require("../src/data/courses/medgen.json"),
  compapp: require("../src/data/courses/compapp.json"),
  algebra: require("../src/data/courses/algebra.json"),
  stats: require("../src/data/courses/stats.json"),
  commskills: require("../src/data/courses/commskills.json"),
  bmc: require("../src/data/courses/bmc.json"),
  cellstruct: require("../src/data/courses/cellstruct.json"),

};
const STAKES = [10, 25, 50, 100]; // quick picks in the app; players may type any amount in range
const MIN_STAKE = 5, MAX_STAKE = 1000;
const MIN_N = 3, MAX_N = 20;      // questions per battle are chosen by the challenger
const N = 7;            // default
const T = 20;           // seconds per question
const GRACE = 1500;     // ms of slack for slow networks
const REVEAL = 2500;    // ms between a question closing and the next one starting
const LEAD = 6000;      // ms between accepting and question 1
const INVITE_TTL = 24 * 3600 * 1000;
const MAX_OPEN = 5;
const LOBBY_TTL = 10 * 60 * 1000; // an accepted battle waits this long for both players to enter the room
const PRESENCE_TTL = 25000;       // a player counts as "in the room" if they checked in this recently

function hash(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }
const FIGURE = /\b(figure|image|diagram|picture|photograph|shown|illustrat|above|below|arrow|labell?ed)\b/i;

function pool(course, allowed) {
  const ids = course === "mixed" ? (allowed || Object.keys(COURSES)) : [course];
  const out = [], seen = new Set();
  for (const cid of ids) {
    for (const set of COURSES[cid].sets) for (const q of set.questions) {
      if (!q.q || !Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6 || typeof q.a !== "number" || q.a < 0 || q.a >= q.o.length) continue;
      if (FIGURE.test(q.q) || q.q.length > 400) continue;
      const id = hash(cid + "|" + q.q + "|" + q.o.join("|"));
      if (seen.has(id)) continue; seen.add(id);
      out.push({ id, q: q.q, o: q.o, a: q.a, e: q.e || "" });
    }
  }
  return out;
}
function pick(arr, n) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }

const fail = (code, msg) => Object.assign(new Error(msg), { code });
const clean = (o) => JSON.parse(JSON.stringify(o));

// XP the student can stake: their own XP plus what battles have added or taken away.
async function balance(t, db, uid) {
  const [p, l] = await Promise.all([t.get(db.collection("progress").doc(uid)), t.get(db.collection("battleLedger").doc(uid))]);
  return Math.floor((p.exists ? Number(p.data().xp) || 0 : 0) + (l.exists ? l.data().net || 0 : 0));
}
const ledgerAdd = (t, db, uid, d, extra = {}) => {
  const ref = db.collection("battleLedger").doc(uid);
  const f = admin.firestore.FieldValue;
  t.set(ref, { net: f.increment(d), ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, f.increment(v)])), updatedAt: Date.now() }, { merge: true });
};

async function handle(db, me, body) {
  const now = Date.now();
  const bref = (id) => db.collection("battles").doc(String(id));

  if (body.action === "time") return { now };

  if (body.action === "create") {
    const stake = Number(body.stake), course = String(body.course || "mixed"), opp = String(body.opponent || "");
    const n = body.n === undefined ? N : Number(body.n);
    if (!Number.isInteger(stake) || stake < MIN_STAKE || stake > MAX_STAKE) throw fail(400, `Stake between ${MIN_STAKE} and ${MAX_STAKE} XP.`);
    if (!Number.isInteger(n) || n < MIN_N || n > MAX_N) throw fail(400, `Choose between ${MIN_N} and ${MAX_N} questions.`);
    if (course !== "mixed" && !COURSES[course]) throw fail(400, "Unknown course.");
    if (!opp || opp === me.uid) throw fail(400, "Pick someone else to challenge.");
    // questions must come from courses BOTH students are allowed to study (their class is locked)
    const [mine, theirs] = await Promise.all([allowedCourses(db, me.uid), allowedCourses(db, opp)]);
    const shared = mine.filter((c) => theirs.includes(c) && COURSES[c]);
    if (!shared.length) throw fail(400, "You and that student don't share a class, so you can't battle each other.");
    if (course !== "mixed" && !shared.includes(course)) throw fail(400, "That course isn't in both of your classes.");
    const [ou, mu] = await Promise.all([db.collection("users").doc(opp).get(), db.collection("users").doc(me.uid).get()]);
    if (!ou.exists || !mu.exists) throw fail(404, "That student wasn't found.");
    const open = await db.collection("battles").where("challenger", "==", me.uid).where("status", "==", "invited").get();
    if (open.docs.filter((d) => now - d.data().createdAt < INVITE_TTL).length >= MAX_OPEN) throw fail(429, "You have too many open challenges. Cancel one first.");
    const bal = await db.runTransaction((t) => balance(t, db, me.uid));
    if (bal < stake) throw fail(400, `You only have ${bal} XP to stake.`);
    const all = pool(course, shared);
    if (all.length < n) throw fail(400, `Only ${all.length} questions are available for that choice. Pick fewer questions.`);
    const qs = pick(all, n);
    const ref = db.collection("battles").doc();
    await db.runTransaction(async (t) => {
      t.set(ref, clean({
        players: [me.uid, opp], challenger: me.uid, names: { [me.uid]: mu.data().username, [opp]: ou.data().username },
        stake, course, status: "invited", N: n, T, createdAt: now,
        questions: qs.map(({ id, q, o }) => ({ id, q, o })), qStart: [], scores: { [me.uid]: 0, [opp]: 0 }, ans: {}, reveal: {},
      }));
      t.set(db.collection("battleKeys").doc(ref.id), { key: qs.map((x) => ({ a: x.a, e: x.e })) });
    });
    await db.collection("users").doc(opp).collection("notifications").add({ type: "battle", from: me.uid, fromName: mu.data().username, text: `challenged you to a ⚡${stake} XP battle (${n} questions)`, read: false, createdAt: now }).catch(() => {});
    await sendPush(db, opp, { type: "battle", fromName: mu.data().username, text: `challenged you to a ⚡${stake} XP battle (${n} questions)` });
    return { id: ref.id };
  }

  const id = body.id;
  if (!id) throw fail(400, "Missing battle.");

  if (body.action === "decline" || body.action === "cancel") {
    return db.runTransaction(async (t) => {
      const s = await t.get(bref(id)); if (!s.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (b.status !== "invited") throw fail(409, "That challenge is no longer open.");
      if (body.action === "decline" && b.players[1] !== me.uid) throw fail(403, "Not yours to decline.");
      if (body.action === "cancel" && b.challenger !== me.uid) throw fail(403, "Not yours to cancel.");
      t.update(bref(id), { status: body.action === "decline" ? "declined" : "cancelled", endedAt: now });
      return { ok: true };
    });
  }

  if (body.action === "accept") {
    const res = await db.runTransaction(async (t) => {
      const s = await t.get(bref(id)); if (!s.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (b.status !== "invited") throw fail(409, "That challenge is no longer open.");
      if (b.players[1] !== me.uid) throw fail(403, "This challenge isn't for you.");
      if (now - b.createdAt > INVITE_TTL) throw fail(410, "That challenge has expired.");
      const [ba, bb] = [await balance(t, db, b.players[0]), await balance(t, db, b.players[1])];
      if (bb < b.stake) throw fail(400, `You need ${b.stake} XP to accept (you have ${bb}).`);
      if (ba < b.stake) throw fail(400, `${b.names[b.players[0]]} no longer has enough XP for this stake.`);
      ledgerAdd(t, db, b.players[0], -b.stake); ledgerAdd(t, db, b.players[1], -b.stake);
      // not live yet: both players have to enter the battle room first (see "join")
      t.update(bref(id), { status: "lobby", acceptedAt: now, present: {} });
      t.set(db.collection("users").doc(b.players[0]).collection("notifications").doc(), { type: "battle", from: me.uid, fromName: b.names[me.uid], text: "accepted your challenge. Enter the battle room!", read: false, createdAt: now });
      return { ok: true, now, _push: [b.players[0], b.names[me.uid]] };
    });
    await sendPush(db, res._push[0], { type: "battle", fromName: res._push[1], text: "accepted your challenge. Enter the battle room!" });
    return { ok: true, now: res.now };
  }

  // Refunds both stakes of an accepted battle that never started.
  const refundLobby = (t, b, why) => {
    ledgerAdd(t, db, b.players[0], b.stake); ledgerAdd(t, db, b.players[1], b.stake);
    t.update(bref(id), { status: "cancelled", endedAt: now, why });
  };

  if (body.action === "join") { // enter the room (and keep checking in). The battle starts once BOTH are in.
    return db.runTransaction(async (t) => {
      const s = await t.get(bref(id)); if (!s.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (!b.players.includes(me.uid)) throw fail(403, "Not your battle.");
      if (b.status === "live" || b.status === "done") return { ok: true, status: b.status };
      if (b.status !== "lobby") throw fail(409, "This battle isn't open.");
      if (now - b.acceptedAt > LOBBY_TTL) { refundLobby(t, b, "timeout"); return { ok: true, status: "cancelled" }; }
      const other = b.players.find((p) => p !== me.uid);
      const otherHere = now - (b.present?.[other] || 0) < PRESENCE_TTL;
      if (otherHere) {
        t.update(bref(id), { [`present.${me.uid}`]: now, status: "live", startAt: now + LEAD, qStart: [now + LEAD] });
        return { ok: true, status: "live" };
      }
      t.update(bref(id), { [`present.${me.uid}`]: now });
      return { ok: true, status: "lobby" };
    });
  }
  if (body.action === "leave") { // stepped out of the room before it started
    return db.runTransaction(async (t) => {
      const s = await t.get(bref(id)); if (!s.exists) return { ok: true };
      const b = s.data();
      if (b.status === "lobby" && b.players.includes(me.uid)) t.update(bref(id), { [`present.${me.uid}`]: 0 });
      return { ok: true };
    });
  }
  if (body.action === "abort") { // call it off before it starts: both get their stake back
    const res = await db.runTransaction(async (t) => {
      const s = await t.get(bref(id)); if (!s.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (!b.players.includes(me.uid)) throw fail(403, "Not your battle.");
      if (b.status !== "lobby") throw fail(409, "It has already started or ended.");
      refundLobby(t, b, "aborted");
      const other = b.players.find((p) => p !== me.uid);
      t.set(db.collection("users").doc(other).collection("notifications").doc(), { type: "battle", from: me.uid, fromName: b.names[me.uid], text: "called off the battle. Your XP was returned.", read: false, createdAt: now });
      return { ok: true };
    });
    return res;
  }

  if (body.action === "answer") {
    const qi = Number(body.qi), pk = Number(body.pick);
    return db.runTransaction(async (t) => {
      const [s, k] = [await t.get(bref(id)), await t.get(db.collection("battleKeys").doc(String(id)))];
      if (!s.exists || !k.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (b.status !== "live" || !b.players.includes(me.uid)) throw fail(409, "This battle isn't live.");
      if (!Number.isInteger(qi) || qi < 0 || qi >= b.N || qi !== b.qStart.length - 1) throw fail(409, "That question is closed.");
      const start = b.qStart[qi];
      if (now < start - 300 || now > start + b.T * 1000 + GRACE) throw fail(409, "Out of time.");
      if (b.ans?.[me.uid]?.[qi]) throw fail(409, "Already answered.");
      const key = k.data().key[qi];
      const ok = Number.isInteger(pk) && pk === key.a;
      const left = Math.max(0, Math.min(1, (start + b.T * 1000 - now) / (b.T * 1000)));
      const pts = ok ? 100 + Math.round(50 * left) : 0;
      const upd = { [`ans.${me.uid}.${qi}`]: { ok, pts, ms: Math.max(0, now - start) }, [`scores.${me.uid}`]: (b.scores?.[me.uid] || 0) + pts };
      const other = b.players.find((p) => p !== me.uid);
      if (b.ans?.[other]?.[qi]) { // both are in: close the question and line up the next
        upd[`reveal.${qi}`] = { a: key.a, e: key.e };
        if (qi < b.N - 1) upd.qStart = [...b.qStart, now + REVEAL];
      }
      t.update(bref(id), upd);
      return { ok, pts, a: key.a, e: key.e, now };
    });
  }

  if (body.action === "advance") { // called when a question's timer has run out
    const qi = Number(body.qi);
    return db.runTransaction(async (t) => {
      const [s, k] = [await t.get(bref(id)), await t.get(db.collection("battleKeys").doc(String(id)))];
      if (!s.exists || !k.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (b.status !== "live" || !b.players.includes(me.uid)) return { ok: true };
      if (qi !== b.qStart.length - 1 || b.reveal?.[qi]) return { ok: true, done: !!b.reveal?.[qi] };
      if (now < b.qStart[qi] + b.T * 1000) throw fail(409, "Not yet.");
      const key = k.data().key[qi];
      const upd = { [`reveal.${qi}`]: { a: key.a, e: key.e } };
      if (qi < b.N - 1) upd.qStart = [...b.qStart, now + REVEAL];
      t.update(bref(id), upd);
      return { ok: true };
    });
  }

  if (body.action === "settle") {
    return db.runTransaction(async (t) => {
      const s = await t.get(bref(id)); if (!s.exists) throw fail(404, "Not found.");
      const b = s.data();
      if (!b.players.includes(me.uid)) throw fail(403, "Not your battle.");
      if (b.status === "lobby") {
        if (now - b.acceptedAt > LOBBY_TTL) { refundLobby(t, b, "timeout"); return { ok: true, status: "cancelled" }; }
        return { ok: true, status: "lobby" };
      }
      if (b.status !== "live") return { ok: true, status: b.status };
      const last = b.N - 1;
      const finished = !!b.reveal?.[last];
      const stale = now > b.startAt + b.N * (b.T * 1000 + REVEAL) + 120000; // everyone left: close it anyway
      if (!finished && !stale) throw fail(409, "Still playing.");
      const [a, c] = b.players; const sa = b.scores?.[a] || 0, sc = b.scores?.[c] || 0;
      const winner = sa === sc ? null : sa > sc ? a : c;
      if (winner) {
        const loser = winner === a ? c : a;
        ledgerAdd(t, db, winner, b.stake * 2, { wins: 1, played: 1 }); ledgerAdd(t, db, loser, 0, { losses: 1, played: 1 });
      } else { ledgerAdd(t, db, a, b.stake, { draws: 1, played: 1 }); ledgerAdd(t, db, c, b.stake, { draws: 1, played: 1 }); }
      t.update(bref(id), { status: "done", winner: winner || null, endedAt: now });
      return { ok: true, status: "done", winner };
    });
  }
  throw fail(400, "Unknown action.");
}

module.exports = async (req, res) => {
  if (require("./_lib").cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ ok: true, stakes: STAKES, minStake: MIN_STAKE, maxStake: MAX_STAKE, minQuestions: MIN_N, maxQuestions: MAX_N, seconds: T });
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    init();
    const me = await uidFrom(req);
    if (!me) return res.status(401).json({ error: "Please log in first." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const out = await handle(admin.firestore(), me, body);
    return res.status(200).json({ ...out, now: Date.now() });
  } catch (e) {
    const code = e.code && Number.isInteger(e.code) ? e.code : 500;
    if (code === 500) console.error("battle error", e);
    return res.status(code).json({ error: code === 500 ? "Something went wrong. Try again." : e.message });
  }
};
module.exports._test = { handle, pool, N, T };
