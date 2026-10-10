import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { Text } from "./Text";
import { useColors } from "./theme";
import { verifyPayment } from "./premium";

// After Paystack sends the student back to the site (?reference=...), confirm the payment and say so.
export default function PayReturn() {
  const COLORS = useColors();
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const ref = q.get("reference") || q.get("trxref");
    if (!ref || !ref.startsWith("ga_")) return;
    window.history.replaceState(null, "", window.location.pathname);
    setMsg("Confirming your payment…");
    verifyPayment(ref)
      .then((r) => setMsg(r.paid ? "⭐ Payment confirmed. Premium is on!" : "Payment not completed yet. If you paid, it can take a minute to show."))
      .catch((e) => setMsg(e?.message ?? "Couldn't confirm the payment."))
      .finally(() => setTimeout(() => setMsg(""), 7000));
  }, []);
  if (!msg) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 20, left: 0, right: 0, alignItems: "center", zIndex: 1000 }}>
      <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderColor: COLORS.accent, borderWidth: 2, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 18, maxWidth: 360 }}>
        <Text style={{ color: COLORS.text, fontWeight: "700", textAlign: "center" }}>{msg}</Text>
      </View>
    </View>
  );
}
