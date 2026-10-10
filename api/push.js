// Sends the phone/browser push for a notification the caller just created.
// The server re-checks the notification really exists and was made by the caller, so nobody can spam arbitrary pushes.
const { admin, init, uidFrom, sendPush, cors } = require("./_lib");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") { const { env } = require("./_lib"); return res.status(200).json({ ok: true, vapid: !!(env("VAPID_PUBLIC_KEY") || env("EXPO_PUBLIC_VAPID_PUBLIC")) && !!env("VAPID_PRIVATE_KEY") }); }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    init();
    const me = await uidFrom(req);
    if (!me) return res.status(401).json({ error: "Please log in first." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const to = String(body.to || ""), id = String(body.id || "");
    if (!to || !id || to === me.uid) return res.status(400).json({ error: "Bad request." });
    const db = admin.firestore();
    const ref = db.collection("users").doc(to).collection("notifications").doc(id);
    const sent = await db.runTransaction(async (t) => {
      const s = await t.get(ref);
      if (!s.exists) return null;
      const n = s.data();
      if (n.from !== me.uid || n.pushed || Date.now() - n.createdAt > 120000) return null;
      t.update(ref, { pushed: true });
      return n;
    });
    if (!sent) return res.status(200).json({ ok: true, sent: 0 });
    return res.status(200).json({ ok: true, sent: await sendPush(db, to, sent) });
  } catch (e) {
    console.error("push error", e);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
