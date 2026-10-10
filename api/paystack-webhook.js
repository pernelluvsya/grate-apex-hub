// Paystack calls this when a payment succeeds, even if the student closed the page.
// In the Paystack dashboard: Settings -> API Keys & Webhooks -> Webhook URL:  https://YOUR-SITE/api/paystack-webhook
const crypto = require("crypto");
const { admin, env, init, extend } = require("./_lib");

const raw = (req) => new Promise((ok, no) => { const c = []; req.on("data", (x) => c.push(x)); req.on("end", () => ok(Buffer.concat(c))); req.on("error", no); });

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const body = await raw(req);
    const sig = crypto.createHmac("sha512", env("PAYSTACK_SECRET_KEY")).update(body).digest("hex");
    if (!env("PAYSTACK_SECRET_KEY") || sig !== req.headers["x-paystack-signature"]) return res.status(401).end();
    const ev = JSON.parse(body.toString("utf8"));
    if (ev.event !== "charge.success") return res.status(200).end();
    init();
    const db = admin.firestore();
    const ref = ev.data && ev.data.reference;
    const pref = db.collection("payments").doc(String(ref));
    await db.runTransaction(async (t) => {
      const p = await t.get(pref);
      if (!p.exists) return;
      const d = p.data();
      if (d.status === "paid") return;
      if (ev.data.amount !== d.amount || ev.data.currency !== d.currency) return; // wrong amount: ignore
      const until = await extend(t, db, d.uid, d.plan, "paystack", String(ref));
      t.update(pref, { status: "paid", until, paidAt: Date.now() });
    });
    return res.status(200).end();
  } catch (e) {
    console.error("webhook error", e && e.message);
    return res.status(500).end();
  }
};
module.exports.config = { api: { bodyParser: false } };
