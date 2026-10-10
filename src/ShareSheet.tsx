import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "./Text";
import { useAuth } from "./auth";
import { useColors } from "./theme";
import { UserHit } from "./social";
import { Group, listMyGroups, sendMessage } from "./groups";
import { Share, fetchFriends, sendDM } from "./messages";
import { Voice, VoiceBubble } from "./voice";
import { Media } from "./media";
import { Doc } from "./docs";
import { Avatar } from "./MediaUI";
import { usePhotos } from "./photos";
import { withIcons as wi } from "./components/em";

export type Fwd = { text?: string; media?: Media[]; share?: Share; audio?: Voice; doc?: Doc };

// "Send" on a post, or "Forward" on a chat message: pick a friend or a group and it lands in that chat.
export default function ShareSheet({ share: postShare, forward, onClose }: { share?: Share | null; forward?: Fwd | null; onClose: () => void }) {
  const share = postShare ?? forward?.share ?? null;
  const open = !!(postShare || forward);
  const fwd = !!forward;
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const me = user && profile ? { uid: user.uid, username: profile.username } : null;
  const [friends, setFriends] = useState<UserHit[]>([]);
  const photos = usePhotos(friends.map((f) => f.uid));
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open || !me) return;
    setSent(new Set()); setNote(""); setErr(""); setLoading(true);
    Promise.all([fetchFriends(me.uid).catch(() => []), listMyGroups(me.uid).catch(() => [])])
      .then(([f, g]) => { setFriends(f); setGroups(g.sort((a, b) => a.name.localeCompare(b.name))); })
      .finally(() => setLoading(false));
  }, [open, share?.id, forward, me?.uid]);

  const mark = (k: string) => setSent((s) => new Set(s).add(k));
  const toFriend = async (f: UserHit) => {
    if (!me || !open) return;
    setBusy("f" + f.uid); setErr("");
    try { await sendDM(me, f, forward ? (forward.text ?? "") : note, forward ? { media: forward.media, share: forward.share, audio: forward.audio, doc: forward.doc, fwd: true } : { share: share! }); mark("f" + f.uid); }
    catch (e: any) { setErr(`Couldn't send to @${f.username} (${e?.code ?? "error"}). Publish the latest Firestore rules.`); }
    setBusy("");
  };
  const toGroup = async (g: Group) => {
    if (!me || !open) return;
    setBusy("g" + g.id); setErr("");
    try { await sendMessage(g.id, forward ? (forward.text ?? "") : note, me, forward?.media, forward ? forward.share : share!, forward ? { audio: forward.audio, doc: forward.doc, fwd: true } : {}); mark("g" + g.id); }
    catch (e: any) { setErr(`Couldn't send to ${g.name} (${e?.code ?? "error"}). Publish the latest Firestore rules.`); }
    setBusy("");
  };

  const row = (key: string, label: string, sub: string, onPress: () => void, avatar?: string, photo?: string) => (
    <TouchableOpacity key={key} onPress={onPress} disabled={busy === key || sent.has(key)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
      <Avatar name={avatar ?? label} photo={photo} size={36} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: COLORS.text, fontWeight: "700" }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>{sub}</Text>
      </View>
      {busy === key ? <ActivityIndicator color={COLORS.accent} />
        : <Text style={{ color: sent.has(key) ? "#22c55e" : COLORS.accent, fontWeight: "800" }}>{sent.has(key) ? wi("✓ Sent") : "Send"}</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: "80%", width: "100%", maxWidth: 560, alignSelf: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800", flex: 1 }}>{fwd ? "Forward to…" : "Send to…"}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 6 }}><Text style={{ color: COLORS.muted, fontWeight: "800", fontSize: 16 }}>Done</Text></TouchableOpacity>
          </View>
          {!!forward && (
            <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 }}>
              <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "700" }}>↪ Forwarding</Text>
              {forward.audio ? <VoiceBubble v={forward.audio} /> : forward.doc ? <Text style={{ color: COLORS.text }} numberOfLines={2}>📄 {forward.doc.name}</Text> : <Text style={{ color: COLORS.text }} numberOfLines={3}>{forward.text || (forward.share ? `Post by @${forward.share.username}` : "Photo / video")}</Text>}
            </View>
          )}
          {!!postShare && (
            <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 }}>
              <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "700" }}>@{postShare.username}</Text>
              <Text style={{ color: COLORS.text }} numberOfLines={2}>{postShare.title || postShare.text || "Post"}</Text>
            </View>
          )}
          {!forward && <TextInput value={note} onChangeText={setNote} placeholder="Add a message (optional)" placeholderTextColor={COLORS.muted} maxLength={300}
            style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 10, marginBottom: 8 }} />}
          {!!err && <Text style={{ color: COLORS.danger, marginBottom: 6 }}>{err}</Text>}
          <ScrollView keyboardShouldPersistTaps="handled">
            {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 12 }} />}
            {!loading && friends.length === 0 && groups.length === 0 && <Text style={{ color: COLORS.muted, marginVertical: 12 }}>No friends or groups yet. Friends are people you follow who follow you back.</Text>}
            {friends.length > 0 && <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "800", marginTop: 6 }}>FRIENDS</Text>}
            {friends.map((f) => row("f" + f.uid, `@${f.username}`, "Friend", () => toFriend(f), f.username, photos[f.uid]))}
            {groups.length > 0 && <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "800", marginTop: 10 }}>GROUPS</Text>}
            {groups.map((g) => row("g" + g.id, g.name, `👥 ${g.memberUids.length} members`, () => toGroup(g)))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}