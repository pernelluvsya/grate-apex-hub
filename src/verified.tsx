import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Text } from "./Text";
import { useAuth } from "./auth";

// Blue check for admins. A public marker doc verified/{uid} is what everyone reads (the admins collection itself is private);
// admins write their own marker automatically when they open the app (see AdminVerifier), and the rules only allow that for real admins.
const BLUE = "#1d9bf0";
const cache = new Map<string, boolean>();
const waiting = new Map<string, Promise<void>>();

export function useVerified(uid?: string): boolean {
  const [, bump] = useState(0);
  useEffect(() => {
    if (!uid || cache.has(uid)) return;
    let live = true;
    let p = waiting.get(uid);
    if (!p) { p = getDoc(doc(db, "verified", uid)).then((d) => { cache.set(uid, d.exists()); }).catch(() => { cache.set(uid, false); }).finally(() => waiting.delete(uid)); waiting.set(uid, p); }
    p.then(() => { if (live) bump((n) => n + 1); });
    return () => { live = false; };
  }, [uid]);
  return !!uid && cache.get(uid) === true;
}

// A proper scalloped verification badge with a white tick (drawn as SVG, no emoji).
// inline: sits inside a line of text. Otherwise a standalone badge for use in a row.
const SEAL = "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z";
const TICK = "M9.4 16.6l-3.5-3.5 1.5-1.5 2 2 5.2-5.2 1.5 1.5z";
export function VerifiedBadge({ uid, size = 16, inline }: { uid?: string; size?: number; inline?: boolean }) {
  const ok = useVerified(uid);
  if (!ok) return null;
  const mark = (
    <View accessibilityLabel="Verified" style={{ marginLeft: inline ? 3 : 5, justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={SEAL} fill={BLUE} />
        <Path d={TICK} fill="#fff" />
      </Svg>
    </View>
  );
  return mark;
}

// Mounted once: if the signed-in person is an admin, publish their verified marker.
export function AdminVerifier() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "admins", user.uid)).then((a) => { if (a.exists()) { cache.set(user.uid, true); return setDoc(doc(db, "verified", user.uid), { at: Date.now() }); } }).catch(() => {});
  }, [user?.uid]);
  return null;
}
