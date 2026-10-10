// Daily streak reminder. Vercel runs this on the schedule in vercel.json ("crons"), once a day in the evening.
// For every student with push turned on who has a live streak but hasn't studied yet today, it sends one notification.
// Needs the env var CRON_SECRET (any long random text): Vercel sends it as "Authorization: Bearer <secret>" on cron calls.
// Days are stored by the app as the student's local date; Ghana is UTC, so "today" here is the UTC date.
const { admin, init, env, sendRaw } = require("./_lib");

const dayStr = (d) => d.toISOString().slice(0, 10);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const secret = env("CRON_SECRET");
  if (!secret) return res.status(500).json({ error: "Set the CRON_SECRET environment variable first." });
  if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Not allowed." });
  try {
    init();
    const db = admin.firestore();
    const dry = req.query && req.query.dry === "1";
    const subs = await db.collectionGroup("pushSubs").get();
    const uids = [...new Set(subs.docs.map((d) => d.ref.parent.parent && d.ref.parent.parent.id).filter(Boolean))];
    const now = new Date(), today = dayStr(now);
    let sent = 0, eligible = 0;
    for (let i = 0; i < uids.length; i += 25) {
      await Promise.all(uids.slice(i, i + 25).map(async (uid) => {
        const [u, p] = await Promise.all([db.collection("users").doc(uid).get(), db.collection("progress").doc(uid).get()]);
        if (!u.exists || u.data().remindersOff || !p.exists) return;
        const days = p.data().days || {};
        if (days[today]) return;                                  // already studied today
        let n = 0; const d = new Date(now); d.setUTCDate(d.getUTCDate() - 1);
        while (days[dayStr(d)]) { n++; d.setUTCDate(d.getUTCDate() - 1); }
        if (n < 1) return;                                        // no streak to protect
        eligible++;
        if (dry) return;
        const body = n === 1 ? "Study a little today and make your 1-day streak 2! 🔥" : `🔥 Your ${n}-day streak ends tonight! Answer a few questions to keep it going.`;
        sent += await sendRaw(db, uid, { title: "Keep your streak alive", body, tag: "streak", url: "/" });
      }));
    }
    return res.status(200).json({ ok: true, devices: subs.size, students: uids.length, eligible, sent, dry: !!dry });
  } catch (e) {
    console.error("reminders error", e);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
