// Payments. One function, several actions (all need a logged-in student):
//   { action: "init", plan: "sem1" | "sem2" }   start a Paystack payment, returns { url }
//   { action: "verify", reference }              after paying: confirm with Paystack and switch Premium on
//   { action: "decide", id, approve, note? }     ADMIN ONLY: approve or reject a manual MoMo request
//
// Vercel settings: PAYSTACK_SECRET_KEY (sk_test_... to try it, sk_live_... to go live), FIREBASE_SERVICE_ACCOUNT.
// Admins: create a Firestore document admins/<their uid> (any content) in the Firebase console.
const { admin, env, init, PLANS, uidFrom, extend } = require("./_lib");

async function paystack(path, method, body) {
  const r = await fetch("https://api.paystack.co" + path, {
    method,
    headers: { Authorization: "Bearer " + env("PAYSTACK_SECRET_KEY"), "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.status === false) throw new Error(j.message || "Paystack error");
  return j.data;
}

// Mark a payment paid and give the student their days, exactly once (safe if called twice).
async function grantPaid(db, ref) {
  const pref = db.collection("payments").doc(ref);
  return db.runTransaction(async (t) => {
    const p = await t.get(pref);
    if (!p.exists) throw new Error("Unknown payment");
    const d = p.data();
    if (d.status === "paid") return d.until;
    const until = await extend(t, db, d.uid, d.plan, "paystack", ref);
    t.update(pref, { status: "paid", until, paidAt: Date.now() });
    return until;
  });
}

module.exports = async (req, res) => {
  if (require("./_lib").cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ ok: true, paystack: !!env("PAYSTACK_SECRET_KEY"), firebase: !!env("FIREBASE_SERVICE_ACCOUNT"), plans: PLANS });
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    init();
    const db = admin.firestore();
    const who = await uidFrom(req);
    if (!who) return res.status(401).json({ error: "Please log in again." });
    const uid = who.uid;
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    if (b.action === "init") {
      if (!env("PAYSTACK_SECRET_KEY")) return res.status(503).json({ error: "Card and MoMo payments aren't set up yet." });
      const plan = PLANS[b.plan] ? b.plan : null;
      if (!plan) return res.status(400).json({ error: "Pick a plan." });
      const amount = PLANS[plan].ghs * 100; // Paystack counts in pesewas
      const reference = "ga_" + uid.slice(0, 6) + "_" + Date.now();
      const site = (req.headers["x-forwarded-proto"] || "https") + "://" + req.headers.host;
      const data = await paystack("/transaction/initialize", "POST", {
        email: who.email || uid + "@grateapex.app", amount, currency: "GHS", reference,
        callback_url: site + "/", channels: ["card", "mobile_money"], metadata: { uid, plan },
      });
      await db.collection("payments").doc(reference).set({ uid, plan, amount, currency: "GHS", status: "pending", source: "paystack", createdAt: Date.now() });
      return res.status(200).json({ url: data.authorization_url, reference });
    }

    if (b.action === "verify") {
      const reference = String(b.reference || "").slice(0, 80);
      const snap = await db.collection("payments").doc(reference).get();
      if (!snap.exists || snap.data().uid !== uid) return res.status(404).json({ error: "Payment not found." });
      const rec = snap.data();
      if (rec.status === "paid") return res.status(200).json({ paid: true, until: rec.until });
      const data = await paystack("/transaction/verify/" + encodeURIComponent(reference), "GET");
      if (data.status !== "success") return res.status(200).json({ paid: false, status: data.status });
      if (data.amount !== rec.amount || data.currency !== rec.currency) return res.status(400).json({ error: "Payment amount didn't match." });
      return res.status(200).json({ paid: true, until: await grantPaid(db, reference) });
    }

    if (b.action === "decide") {
      if (!(await db.collection("admins").doc(uid).get()).exists) return res.status(403).json({ error: "Not allowed." });
      const id = String(b.id || "").slice(0, 80);
      const rref = db.collection("momoRequests").doc(id);
      const out = await db.runTransaction(async (t) => {
        const s = await t.get(rref);
        if (!s.exists) throw Object.assign(new Error("Request not found."), { code: 404 });
        const d = s.data();
        if (d.status !== "pending") throw Object.assign(new Error("Already decided."), { code: 409 });
        if (!b.approve) { t.update(rref, { status: "rejected", note: String(b.note || "").slice(0, 200), decidedAt: Date.now(), decidedBy: uid }); return { status: "rejected" }; }
        const dup = await t.get(db.collection("momoRequests").where("reference", "==", d.reference).where("status", "==", "approved").limit(1));
        if (!dup.empty) throw Object.assign(new Error("That MoMo reference was already used for another approval."), { code: 409 });
        const until = await extend(t, db, d.uid, d.plan, "momo", id);
        t.update(rref, { status: "approved", decidedAt: Date.now(), decidedBy: uid, until });
        return { status: "approved", until };
      });
      return res.status(200).json(out);
    }
    return res.status(400).json({ error: "Bad request." });
  } catch (e) {
    console.error("pay error", e && e.message);
    const code = e && e.code === 404 ? 404 : e && e.code === 409 ? 409 : 500;
    return res.status(code).json({ error: code === 500 ? "Something went wrong with the payment. Try again." : e.message });
  }
};
