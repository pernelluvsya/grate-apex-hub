// Rings a friend's phone/browser for an audio call even when the app is closed (WhatsApp style).
//   kind "ring":   sent right after the caller writes the invite. Re-checked on the server, so nobody can ring a stranger.
//   kind "cancel": sent when the caller hangs up before it was answered. Closes the ringing notification and leaves "Missed call".
const { admin, init, uidFrom, sendRaw, cors } = require("./_lib");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    init();
    const me = await uidFrom(req);
    if (!me) return res.status(401).json({ error: "Please log in first." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const to = String(body.to || ""), callId = String(body.callId || ""), kind = String(body.kind || "");
    if (!to || !callId || to === me.uid || !["ring", "cancel"].includes(kind)) return res.status(400).json({ error: "Bad request." });
    const db = admin.firestore();
    const callRef = db.collection("calls").doc(callId);
    const tag = `call-${callId}`;

    if (kind === "ring") {
      const invRef = db.collection("users").doc(to).collection("callInvites").doc(callId);
      const inv = await db.runTransaction(async (t) => {
        const s = await t.get(invRef);
        if (!s.exists) return null;
        const d = s.data();
        if (d.from !== me.uid || d.pushed || Date.now() - (d.at || 0) > 60000) return null;
        t.update(invRef, { pushed: true });
        return d;
      });
      if (!inv) return res.status(200).json({ ok: true, sent: 0 });
      await callRef.update({ ringed: admin.firestore.FieldValue.arrayUnion(to) }).catch(() => {});
      const group = Object.keys(inv.names || {}).length > 2;
      const sent = await sendRaw(db, to, {
        type: "call", callId, tag, from: me.uid, fromName: inv.fromName,
        title: `📞 @${inv.fromName}`, body: group ? "Incoming group audio call" : "Incoming audio call", url: "/",
      }, { ttl: 45, urgency: "high" });
      return res.status(200).json({ ok: true, sent });
    }

    // cancel: only if this person was rung, never answered or declined, and I'm on the call
    const c = await callRef.get();
    if (!c.exists) return res.status(200).json({ ok: true, sent: 0 });
    const call = c.data();
    if (!(call.members || []).includes(me.uid) || !(call.members || []).includes(to) || !(call.ringed || []).includes(to)) return res.status(200).json({ ok: true, sent: 0 });
    const peer = await callRef.collection("peers").doc(to).get();
    if (peer.exists) return res.status(200).json({ ok: true, sent: 0 });
    await callRef.update({ ringed: admin.firestore.FieldValue.arrayRemove(to) }).catch(() => {});
    const sent = await sendRaw(db, to, {
      type: "call-cancel", callId, tag, fromName: (call.names || {})[me.uid] || "A friend",
      title: "Missed call", body: `@${(call.names || {})[me.uid] || "A friend"} called you`, url: "/",
    }, { ttl: 3600, urgency: "high" });
    return res.status(200).json({ ok: true, sent });
  } catch (e) {
    console.error("callpush error", e);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
