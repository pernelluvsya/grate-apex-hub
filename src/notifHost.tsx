import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "./Text";
import { useAuth } from "./auth";
import { useColors } from "./theme";
import Background from "./Background";
import { Column } from "./ui";
import Icon from "./Icon";
import { Avatar } from "./MediaUI";
import { timeAgo } from "./community";
import { Notif, describeNotif, markRead, clearNotifs, watchNotifs } from "./notifications";
import { useProfileHost } from "./profileHost";
import { useBattles } from "./battleHost";
import { useAfterDismiss } from "./afterDismiss";
import { usePhotos } from "./photos";
import { confirmAsk } from "./confirm";
import { PushState, enablePush, pushState } from "./push";
import { Em } from "./components/em";
import { withIcons as wi } from "./components/em";

const Ctx = createContext<{ open: () => void; unread: number }>({ open: () => { }, unread: 0 });
export const useNotifs = () => useContext(Ctx);
const ICON: Record<string, string> = { like: "❤️", comment: "💬", reshare: "🔁", follow: "👤", reply: "💬", battle: "⚔️", support: "🛟", message: "✉️" };

// Keeps the unread count for the bell and shows the notifications list.
export function NotifHost({ children, nav }: { children: React.ReactNode; nav?: any }) {
  const COLORS = useColors();
  const { user } = useAuth();
  const profiles = useProfileHost();
  const battles = useBattles();
  const { onDismiss, closeThen } = useAfterDismiss();
  const [items, setItems] = useState<Notif[]>([]);
  const [show, setShow] = useState(false);
  const photos = usePhotos(show ? items.map((n) => n.from) : []);
  const [push, setPush] = useState<PushState>("unsupported");
  useEffect(() => { if (show) pushState().then(setPush); }, [show]);
  const [pushErr, setPushErr] = useState("");
  useEffect(() => { setItems([]); if (user) return watchNotifs(user.uid, setItems); }, [user?.uid]);
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  // opening the list marks everything as read (after a moment, so you still see what was new)
  useEffect(() => {
    if (!show || !user) return;
    const ids = items.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    const t = setTimeout(() => markRead(user.uid, ids), 1500);
    return () => clearTimeout(t);
  }, [show, items.length]);

  const [clearing, setClearing] = useState(false);
  const clearAll = async () => {
    if (!user || !(await confirmAsk("Clear all your notifications?", "Clear"))) return;
    setClearing(true);
    try { await clearNotifs(user.uid); setItems([]); } catch { setPushErr("Couldn't clear them. Publish the latest Firestore rules and try again."); }
    setClearing(false);
  };

  const go = (n: Notif) => {
    closeThen(() => setShow(false), () => {
      if (n.type === "follow") profiles.open(n.from, n.fromName);
      else if (n.type === "battle") battles.open();
      else if (n.type === "reply") nav?.navigate?.("Community");
      else if (n.type === "support") nav?.navigate?.("You");
      else if (n.type === "message") nav?.navigate?.("Community");
      else nav?.navigate?.("Feed");
    });
  };

  return (
    <Ctx.Provider value={{ open: () => setShow(true), unread }}>
      {children}
      <Modal visible={show} animationType="slide" onRequestClose={() => setShow(false)} onDismiss={onDismiss}>
        {show && (
          <Background><Column>
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 60 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: "800", flex: 1 }}>Notifications</Text>
                <TouchableOpacity onPress={() => setShow(false)} style={{ padding: 10 }} accessibilityLabel="Close"><Icon name="close" size={26} color={COLORS.text} /></TouchableOpacity>
              </View>
              {push === "off" && (
                <TouchableOpacity onPress={async () => { setPushErr(""); try { if (user) await enablePush(user.uid); } catch (e: any) { setPushErr(e?.message || "Couldn't turn on."); } setPush(await pushState()); }}
                  style={{ backgroundColor: COLORS.card, borderColor: COLORS.accent, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 }}>
                  <Text style={{ color: COLORS.text, fontWeight: "800" }}><Em n="bell" /> Get notified on this device</Text>
                  <Text style={{ color: COLORS.muted, marginTop: 2 }}>Tap to turn on push notifications, even when the app is closed.</Text>
                  {!!pushErr && <Text style={{ color: COLORS.danger, marginTop: 6 }}>{pushErr}</Text>}
                </TouchableOpacity>
              )}
              {items.length > 0 && (
                <TouchableOpacity onPress={clearAll} disabled={clearing} style={{ alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, opacity: clearing ? 0.5 : 1 }}>
                  <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: 13 }}>{clearing ? "Clearing…" : wi("🗑 Clear all")}</Text>
                </TouchableOpacity>
              )}
              {!!pushErr && push !== "off" && <Text style={{ color: COLORS.danger, marginBottom: 8 }}>{pushErr}</Text>}
              {items.length === 0 && <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 40, lineHeight: 22 }}>Nothing yet.{"\n"}Likes, comments, new followers and battle challenges show up here.</Text>}
              {items.map((n) => (
                <TouchableOpacity key={n.id} onPress={() => go(n)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: n.read ? COLORS.card : COLORS.primary + "22", borderColor: n.read ? COLORS.border : COLORS.primary, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 }}>
                  <Avatar name={n.fromName} photo={photos[n.from]} size={40} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: COLORS.text, lineHeight: 20 }}>{wi(ICON[n.type])} {wi(describeNotif(n))}</Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{timeAgo(n.createdAt)}</Text>
                  </View>
                  {!n.read && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent }} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Column></Background>
        )}
      </Modal>
    </Ctx.Provider>
  );
}

// NotifHost sits above the navigator, so the screens pass their own navigation in.
export function NotifBridge({ children }: { children: React.ReactNode }) {
  const nav = useNavigation<any>();
  return <NotifHost nav={nav}>{children}</NotifHost>;
}

// The round bell with the unread badge. Shown on every screen: floating on a phone, in the sidebar on a computer.
export function BellButton({ size = 44 }: { size?: number }) {
  const COLORS = useColors();
  const { open, unread } = useNotifs();
  return (
    <TouchableOpacity onPress={open} accessibilityLabel="Notifications" style={{ width: size, height: size, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg + "f2", alignItems: "center", justifyContent: "center" }}>
      <Icon name="bell" size={20} color={COLORS.text} />
      {unread > 0 && (
        <View style={{ position: "absolute", top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: COLORS.bg }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}