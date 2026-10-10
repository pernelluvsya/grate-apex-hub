import { API_BASE } from "./apiBase";
import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase";
import { useAuth } from "./auth";
import { PlanId } from "./plans";

// Is this student a Premium subscriber? Read from subscriptions/{uid}, which only the server can write.
// Nothing in the app is locked behind it yet: when you decide what Premium unlocks, check `premium` there.
type Ctx = { premium: boolean; until: number; plan?: string; loading: boolean };
const PCtx = createContext<Ctx>({ premium: false, until: 0, loading: false });
export const usePremium = () => useContext(PCtx);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [s, setS] = useState<{ until: number; plan?: string }>({ until: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setS({ until: 0 }); setLoading(false); return; }
    return onSnapshot(doc(db, "subscriptions", user.uid), (d) => { setS(d.exists() ? (d.data() as any) : { until: 0 }); setLoading(false); }, () => setLoading(false));
  }, [user]);
  return <PCtx.Provider value={{ premium: s.until > Date.now(), until: s.until, plan: s.plan, loading }}>{children}</PCtx.Provider>;
}

// ---- talking to the payment function ----
async function call(body: object): Promise<any> {
  const tok = await auth.currentUser?.getIdToken();
  if (!tok) throw new Error("Please log in first.");
  let r: Response;
  try { r = await fetch(`${API_BASE}/api/pay`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify(body) }); }
  catch { throw new Error("Couldn't reach the payment server. Check your internet."); }
  let j: any = null; try { j = await r.json(); } catch { /* not JSON */ }
  if (!j) throw new Error("Payments aren't available here yet.");
  if (!r.ok) throw new Error(j.error || "Payment failed.");
  return j;
}
export const startPaystack = (plan: PlanId): Promise<{ url: string; reference: string }> => call({ action: "init", plan });
export const verifyPayment = (reference: string): Promise<{ paid: boolean; until?: number }> => call({ action: "verify", reference });
export const decideMomo = (id: string, approve: boolean, note?: string) => call({ action: "decide", id, approve, note });
