// Shared helpers for the payment functions. (Files starting with _ are not public endpoints.)
const admin = require("firebase-admin");

const env = (name) => {
  const k = Object.keys(process.env).find((x) => x.trim() === name);
  return k ? String(process.env[k]).trim().replace(/^["']|["']$/g, "") : "";
};

function init() {
  if (admin.apps.length) return;
  const raw = env("FIREBASE_SERVICE_ACCOUNT");
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}

// What can be bought. The server decides prices, never the app. (Keep in step with src/config.ts for display.)
const PLANS = {
  sem1: { ghs: 25, days: 150, label: "1 semester" },
  sem2: { ghs: 40, days: 300, label: "2 semesters" },
};

async function uidFrom(req) {
  const tok = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!tok) return null;
  try { return await admin.auth().verifyIdToken(tok); } catch { return null; }
}

// Add the plan's days to the student's subscription (extending from whichever is later: now or their current end date).
function extend(t, db, uid, plan, source, ref) {
  const sref = db.collection("subscriptions").doc(uid);
  return t.get(sref).then((s) => {
    const now = Date.now(), cur = s.exists ? s.data().until || 0 : 0;
    const until = Math.max(now, cur) + PLANS[plan].days * 86400000;
    t.set(sref, { until, plan, source, ref, updatedAt: now });
    return until;
  });
}

const ACCESS = require("../src/data/access.json");
// Which courses this student may use, from the hall + semester they locked in at sign-up.
async function allowedCourses(db, uid) {
  const u = await db.collection("users").doc(uid).get();
  const d = u.exists ? u.data() : {};
  // your own hall + semester; HB2, HB3 and MB1-MB3 can also use every HB1/HB2 course (keep in step with canSee in src/data/catalog.ts)
  const advanced = ["HB2", "HB3", "MB1", "MB2", "MB3"].includes(d.hall);
  return Object.keys(ACCESS).filter((c) => (advanced && (ACCESS[c].halls.includes("HB1") || ACCESS[c].halls.includes("HB2"))) || (ACCESS[c].halls.includes(d.hall) && ACCESS[c].semesters.includes(d.semester)));
}

// Lets the app call these functions from another address (e.g. a local dev server). Safe because every call needs a login token.
function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") { res.status(204).end(); return true; }
  return false;
}

// ---- Web push ----
// Needs VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (make them with: npx web-push generate-vapid-keys). Optional VAPID_SUBJECT.
let wp = null;
function webpush() {
  if (wp) return wp;
  const pub = env("VAPID_PUBLIC_KEY") || env("EXPO_PUBLIC_VAPID_PUBLIC"), priv = env("VAPID_PRIVATE_KEY");
  if (!pub || !priv) return null;
  wp = require("web-push");
  wp.setVapidDetails(env("VAPID_SUBJECT") || "https://grate-apex-hub.vercel.app", pub, priv);
  return wp;
}
const NOTE = { like: "liked your post", comment: "commented on your post", reshare: "reshared your post", follow: "started following you", reply: "replied to your discussion", battle: "challenged you to an XP battle", support: "replied to your support message" };
// Sends a push to every device this student turned notifications on for. Never throws.
async function sendRaw(db, uid, payloadObj, opts = {}) {
  try {
    const w = webpush(); if (!w) return 0;
    const subs = await db.collection("users").doc(uid).collection("pushSubs").get();
    const payload = JSON.stringify(payloadObj);
    let sent = 0;
    await Promise.all(subs.docs.map(async (d) => {
      const s = d.data();
      try { await w.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: opts.ttl ?? 3600, urgency: opts.urgency || "normal" }); sent++; }
      catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await d.ref.delete().catch(() => {}); }
    }));
    return sent;
  } catch { return 0; }
}
const sendPush = (db, uid, n) => sendRaw(db, uid, { title: "GrAte Apex", body: `@${n.fromName} ${n.text || NOTE[n.type] || "sent you a notification"}`, tag: n.type, url: "/" });

module.exports = { sendPush, sendRaw, allowedCourses, ACCESS, cors, admin, env, init, PLANS, uidFrom, extend };
