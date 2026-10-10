import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "../Text";
import { useAuth } from "../auth";
import { useColors, Colors } from "../theme";
import { Me, clock } from "../community";
import { Avatar, MediaView } from "../MediaUI";
import { Media, pickAndUpload } from "../media";
import { UserHit } from "../social";
import ShareCard from "../ShareCard";
import Background from "../Background";
import { Column, HoverMenu } from "../ui";
import { SkeletonGroup, SkeletonRow } from "../Skeleton";
import { useProfileHost, ProfileHost } from "../profileHost";
import ShareSheet, { Fwd } from "../ShareSheet";
import { DocCard, pickAndUploadDoc } from "../docs";
import { PhotoZoom, ZoomAvatar, usePhotos } from "../photos";
import { useCall } from "../calls";
import { useLayout } from "../responsive";
import { VerifiedBadge } from "../verified";
import { VoiceBubble, fmt, uploadVoice, useVoiceRecorder, voiceSupported } from "../voice";
import { ReactionChips, ReactionPicker } from "../reactions";
import { Chat, DM, ReplyTo, talked, chatId, clearChatForMe, clearedAt, isCleared, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages, editDM, deleteDMForMe, deleteDMForEveryone, canEditOrDeleteForAll, timeUntilEditLocked, EditEntry } from "../messages";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

type MenuAct = { k: string; label: string; on: () => void | Promise<void> };

// In-app confirmation dialog (not window.confirm / Alert).
export type Ask = { title: string; message?: string; label?: string; run: () => void | Promise<void> };
export function ConfirmModal({ ask, onClose }: { ask: Ask | null; onClose: () => void }) {
  const COLORS = useColors();
  return (
    <Modal visible={!!ask} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <TouchableOpacity activeOpacity={1} style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 18, padding: 20, width: "100%", maxWidth: 340 }}>
          <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: "800", marginBottom: 8 }}>{ask?.title}</Text>
          {!!ask?.message && <Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 6 }}>{ask.message}</Text>}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 14 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 10, paddingHorizontal: 16 }}><Text style={{ color: COLORS.muted, fontWeight: "700", fontSize: 15 }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { const a = ask; onClose(); a?.run(); }} style={{ paddingVertical: 10, paddingHorizontal: 16 }}><Text style={{ color: COLORS.danger, fontWeight: "800", fontSize: 15 }}>{ask?.label ?? "Delete"}</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

type Peer = UserHit;

export default function MessagesView({ onBack }: { onBack: () => void }) {
  const { user, profile } = useAuth();
  const me: Me | null = user && profile ? { uid: user.uid, username: profile.username } : null;
  const [open, setOpen] = useState<Peer | null>(null);
  const [picking, setPicking] = useState(false);
  if (!me) return null;
  // The chat opens full-screen over the tab bar and bell, so the composer sits at the bottom of the phone.
  return (
    <>
      <Inbox me={me} onBack={onBack} picking={picking} setPicking={setPicking} onOpen={setOpen} />
      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)}>
        {/* Own ProfileHost inside this modal so the profile sheet stacks on top of the chat instead of waiting behind it */}
        {open && <ProfileHost><Background><Column max={980}><ChatView key={open.uid} me={me} peer={open} onBack={() => setOpen(null)} /></Column></Background></ProfileHost>}
      </Modal>
    </>
  );
}

function Inbox({ me, onBack, picking, setPicking, onOpen }: { me: Me; onBack: () => void; picking: boolean; setPicking: (b: boolean) => void; onOpen: (p: Peer) => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [friends, setFriends] = useState<UserHit[]>([]);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState<Ask | null>(null);
  const [zoom, setZoom] = useState<{ name: string; photo: string } | null>(null);
  const { status: callStatus } = useCall();
  const { wide } = useLayout();
  const photos = usePhotos([...(chats ?? []).map((c) => otherOf(c, me.uid)), ...friends.map((f) => f.uid)]);
  useEffect(() => watchChats(me.uid, setChats, (e) => setError(`Couldn't load messages (${e?.code ?? "error"}). Publish the latest Firestore rules.`)), [me.uid]);
  const shown = chats?.filter((c) => !isCleared(c, me.uid));
  useEffect(() => { if (picking) fetchFriends(me.uid).then(setFriends).catch(() => { }); }, [picking, me.uid]);

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: wide ? 28 : 20, paddingTop: 20 }}>
      <TouchableOpacity onPress={picking ? () => setPicking(false) : onBack}><Text style={s.back}>‹ {picking ? "Messages" : "Community"}</Text></TouchableOpacity>
      <Text style={s.title}><Em n="mail" /> Messages</Text>
      <Text style={s.sub}>Private chats with friends: people you follow who follow you back.</Text>
      {!!callStatus && callStatus !== "on" && <Text style={[s.small, { marginBottom: 10 }]}>📞 Incoming calls: {callStatus}</Text>}
      {picking ? (
        <>
          <Text style={s.cardTitle}>Who do you want to message?</Text>
          {friends.length === 0 && <Text style={[s.small, { marginTop: 8 }]}>No friends yet. Follow classmates in Compete → Find; once they follow you back you can message them.</Text>}
          {friends.map((f) => (
            <TouchableOpacity key={f.uid} style={[s.card, { flexDirection: "row", alignItems: "center" }]} onPress={() => { setPicking(false); onOpen(f); }}>
              <ZoomAvatar name={f.username} photo={photos[f.uid]} size={38} onZoom={setZoom} /><Text style={[s.cardTitle, { marginLeft: 12 }]}>@{f.username}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => setPicking(true)} style={s.newBtn}><Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 16 }}>＋ New message</Text></TouchableOpacity>
          {!!error && <Text style={s.error}>{error}</Text>}
          {chats === null && <SkeletonGroup>{[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}</SkeletonGroup>}
          {shown?.length === 0 && !error && <Text style={[s.small, { marginTop: 14 }]}>No conversations yet. You can also send any post to a friend with its Send button.</Text>}
          {shown?.map((c) => {
            const uid = otherOf(c, me.uid), name = c.names?.[uid] ?? "student", un = isUnread(c, me.uid);
            return (
              <TouchableOpacity
                key={c.id}
                style={[s.card, wide && { padding: 18 }, { flexDirection: "row", alignItems: "center", borderColor: un ? COLORS.primary : COLORS.border }]}
                onPress={() => onOpen({ uid, username: name })}
                onLongPress={() => setAsk({
                  title: `Delete chat with @${name}?`,
                  message: `This removes the conversation from your messages only. @${name} keeps their copy.`,
                  label: "Delete",
                  run: () => clearChatForMe(c.id, me.uid).catch((e: any) => setError(`Couldn't delete this chat (${e?.code ?? "error"}).`)),
                })}
              >
                <ZoomAvatar name={name} photo={photos[uid]} size={wide ? 50 : 42} onZoom={setZoom} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}><Text style={s.cardTitle}>@{name}</Text><VerifiedBadge uid={uid} /></View>
                  <Text style={[s.small, un && { color: COLORS.text, fontWeight: "700" }]} numberOfLines={1}>{c.lastFrom === me.uid ? "You: " : ""}{c.lastText || "…"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  {!!c.lastAt && <Text style={[s.small, { fontSize: 11 }, un && { color: COLORS.accent }]}>{clock(c.lastAt)}</Text>}
                  {un && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent, marginTop: 4 }} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
      <ConfirmModal ask={ask} onClose={() => setAsk(null)} />
      <PhotoZoom pic={zoom} onClose={() => setZoom(null)} />
    </ScrollView>
  );
}

// Must be rendered inside a ProfileHost that lives within the same modal as the chat (see MessagesView / ChatHost).
export function ChatView({ me, peer, onBack }: { me: Me; peer: Peer; onBack: () => void }) {
  const { open: onOpenProfile } = useProfileHost();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const id = chatId(me.uid, peer.uid);
  const [messages, setMessages] = useState<DM[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState<number | null>(null);
  const scroller = useRef<ScrollView>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [replyTo, setReplyTo] = useState<DM | null>(null);
  const [menu, setMenu] = useState<DM | null>(null);
  const [fwd, setFwd] = useState<Fwd | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const rec = useVoiceRecorder();
  const { call, busy: inCall } = useCall();
  const { wide } = useLayout();
  const [zoom, setZoom] = useState<{ name: string; photo: string } | null>(null);
  const peerPhoto = usePhotos([peer.uid])[peer.uid];
  const [docUp, setDocUp] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [ask, setAsk] = useState<Ask | null>(null);
  const askLater = (a: Ask) => { setTimeout(() => setAsk(a), 200); }; // lets the message menu finish closing first
  const [editHistory, setEditHistory] = useState<EditEntry[]>([]);
  const [showEditHistory, setShowEditHistory] = useState(false);

  const peerSeen = chat?.seen?.[peer.uid] ?? 0;

  // "typing…": show it for 5 seconds after the friend's typing value last changed (we compare arrival times on this device, so clocks don't matter)
  const [peerTyping, setPeerTyping] = useState(false);
  const typingVal = chat?.typing?.[peer.uid] ?? 0;
  useEffect(() => {
    if (!typingVal) { setPeerTyping(false); return; }
    setPeerTyping(true);
    const t = setTimeout(() => setPeerTyping(false), 5000);
    return () => clearTimeout(t);
  }, [typingVal]);
  // tell the friend we're typing (at most every 3 s), and that we stopped
  const lastTyping = useRef(0);
  const onType = (v: string) => {
    setText(v);
    if (v.trim() && Date.now() - lastTyping.current > 3000) { lastTyping.current = Date.now(); setTyping(id, me.uid, true); }
    else if (!v.trim() && lastTyping.current) { lastTyping.current = 0; setTyping(id, me.uid, false); }
  };
  useEffect(() => () => { if (lastTyping.current) setTyping(id, me.uid, false); }, [id]);

  // A listener that errors is dead for good. Before the first message the chat doesn't exist yet, so reading is denied;
  // re-subscribe after every send (and retry while denied) so new messages always show up.
  const [tick, setTick] = useState(0);
  const post = async (t: string, o: any = {}) => { await sendDM(me, peer, t, o); setTick((x) => x + 1); };
  useEffect(() => watchChat(id, setChat), [id, tick]);
  useEffect(() => {
    let retry: any;
    const un = watchMessages(id, (m) => { setMessages(m); markSeen(id, me.uid); },
      (e) => {
        if (e?.code === "permission-denied") retry = setTimeout(() => setTick((x) => x + 1), 2500);
        else setError(`Chat error (${e?.code ?? "error"}).`);
      });
    return () => { un(); clearTimeout(retry); };
  }, [id, tick]);

  const send = async () => {
    const t = text.trim(); if (!t) return;
    setText(""); setError("");
    if (lastTyping.current) { lastTyping.current = 0; setTyping(id, me.uid, false); }
    const reply = quote(replyTo); setReplyTo(null);
    try { await post(t, reply ? { reply } : {}); }
    catch (e: any) { setText(t); setError(`Couldn't send (${e?.code ?? "error"}). You can only message friends (you follow each other). Publish the latest Firestore rules.`); }
  };
  const attach = async () => {
    setError(""); setSending(0);
    try { const m: Media | null = await pickAndUpload({ onProgress: setSending }); if (m) await post("", { media: [m] }); }
    catch (e: any) { setError(e?.message ?? "Couldn't send that."); }
    finally { setSending(null); }
  };
  const attachDoc = async () => {
    setError(""); setDocUp(0);
    try { const d = await pickAndUploadDoc(setDocUp); if (d) { const reply = quote(replyTo); setReplyTo(null); await post("", { doc: d, ...(reply ? { reply } : {}) }); } }
    catch (e: any) { setError(e?.message ?? "Couldn't send that document."); }
    finally { setDocUp(null); }
  };
  const react = (m: DM, e: string | null) => { reactDM(id, m.id, me.uid, e).catch(() => setError("Couldn't react. Publish the latest Firestore rules.")); };
  const quote = (m: DM | null): ReplyTo | undefined => m ? { id: m.id, from: m.from, name: m.from === me.uid ? me.username : peer.username, text: snippet(m) } : undefined;
  const startMic = () => { setError(""); rec.start().catch((e: any) => setError(e?.message ?? "Couldn't start recording.")); };
  const sendVoice = async () => {
    const r = await rec.send(); if (!r) return;
    const reply = quote(replyTo); setReplyTo(null); setVoiceBusy(true);
    try { const audio = await uploadVoice(r.blob, r.d); await post("", { audio, ...(reply ? { reply } : {}) }); }
    catch (e: any) { setError(e?.message ?? "Couldn't send the voice message."); }
    setVoiceBusy(false);
  };

  const cleared = clearedAt(chat, me.uid);
  const editing = editingId ? messages.find((m) => m.id === editingId) ?? null : null;
  const submitEdit = () => { if (editing) edit(editing, editText); };
  const edit = async (m: DM, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed || trimmed === m.text) {
      setEditingId(null);
      setEditText("");
      return;
    }
    try {
      await editDM(id, m.id, trimmed, m);
      setEditingId(null);
      setEditText("");
    } catch (e: any) {
      console.error("editDM failed", e);
      if (e?.code === "permission-denied") { setEditingId(null); setEditText(""); }
      setError(e?.code === "permission-denied" ? "Couldn't save the edit (permission-denied). Edits only work within 3 minutes, and the latest Firestore rules must be published." : `Couldn't edit the message (${e?.code ?? e?.message ?? "error"}).`);
    }
  };

  const viewEditHistory = (m: DM) => {
    if (m.editHistory && m.editHistory.length > 0) {
      setEditHistory(m.editHistory);
      setShowEditHistory(true);
    }
  };

  const canEdit = (m: DM): boolean => {
    return m.from === me.uid && canEditOrDeleteForAll(m.createdAt);
  };

  const canDeleteForAll = (m: DM): boolean => {
    return m.from === me.uid && canEditOrDeleteForAll(m.createdAt);
  };

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.chatHead, wide && { paddingTop: 18, paddingHorizontal: 24, paddingBottom: 14 }]}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>‹</Text></TouchableOpacity>
        {/* CHANGE: Use the callback instead of direct profile open */}
        <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => onOpenProfile(peer.uid, peer.username)}>
          <ZoomAvatar name={peer.username} photo={peerPhoto} size={wide ? 42 : 34} onZoom={setZoom} /><View style={{ marginLeft: 10, flexShrink: 1 }}><View style={{ flexDirection: "row", alignItems: "center" }}><Text style={s.cardTitle} numberOfLines={1}>@{peer.username}</Text><VerifiedBadge uid={peer.uid} /></View>{peerTyping && <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "700" }}>typing…</Text>}</View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => call(peer)} disabled={inCall} style={{ padding: 8, opacity: inCall ? 0.4 : 1 }}><Text style={{ fontSize: 22 }}><Em n="phone" /></Text></TouchableOpacity>
      </View>
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: wide ? 28 : 14, paddingBottom: wide ? 20 : 10 }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 && <Text style={[s.small, { textAlign: "center", marginTop: 30 }]}>No messages yet. Say hi </Text>}
        {messages
          .filter(m => !m.deletedFor?.[me.uid] && ms(m.createdAt) > cleared)
          .map((m) => {
            const mine = m.from === me.uid;
            if (m.call) {
              // call log: "Missed call" / "No answer" / "Call declined", or "Answered · 2 min 15 sec"
              const c = m.call, bad = c.status !== "answered";
              const title = c.status === "answered" ? (mine ? "Outgoing call" : "Incoming call")
                : c.status === "declined" ? (mine ? "Call declined" : "You declined")
                  : mine ? "No answer" : "Missed call";
              const sub = c.status === "answered" ? `Answered · ${talked(c.secs)}` : c.status === "declined" ? "Not answered" : mine ? "They didn't pick up" : "You didn't pick up";
              return (
                <TouchableOpacity key={m.id} activeOpacity={0.8} onLongPress={() => setMenu(m)} style={[s.callRow, { borderColor: bad && !mine ? COLORS.danger : COLORS.border }]}>
                  <Text style={{ fontSize: 20 }}>{bad ? wi("📵") : wi("📞")}</Text>
                  <View style={{ marginLeft: 10, flexShrink: 1 }}>
                    <Text style={{ color: bad && !mine ? COLORS.danger : COLORS.text, fontWeight: "800", fontSize: 14 }}>{title}</Text>
                    <Text style={s.small}>{sub} · {clock(m.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            return (
              <SwipeRow key={m.id} maxW={wide ? "68%" : "86%"} onReply={() => setReplyTo(m)} style={[s.bubbleRow, mine && { alignItems: "flex-end" }]}>
                <HoverMenu mine={mine} onMenu={() => setMenu(m)}>
                  <TouchableOpacity activeOpacity={0.9} onLongPress={() => setMenu(m)} style={[s.bubble, wide && s.bubbleWide, mine && s.bubbleMine]}>
                    {m.fwd && <Text style={[s.fwdLbl, mine && { color: COLORS.onPrimary }]}>↪ Forwarded</Text>}
                    {!!m.reply && (
                      <View style={[s.quote, mine && { backgroundColor: "rgba(255,255,255,0.18)", borderLeftColor: COLORS.onPrimary }]}>
                        {/* CHANGE: Make the reply username clickable to open their profile */}
                        <TouchableOpacity onPress={() => {
                          if (m.reply?.from !== me.uid) {
                            onOpenProfile(m.reply?.from || "", m.reply?.name || "");
                          }
                        }}>
                          <Text style={[s.quoteName, mine && { color: COLORS.onPrimary }]}>{m.reply.from === me.uid ? "You" : `@${m.reply.name}`}</Text>
                        </TouchableOpacity>
                        <Text style={[s.small, mine && { color: COLORS.onPrimary, opacity: 0.8 }]} numberOfLines={2}>{m.reply.text}</Text>
                      </View>
                    )}
                    {!!m.audio && <VoiceBubble v={m.audio} mine={mine} />}
                    {!!m.doc && <DocCard d={m.doc} mine={mine} />}
                    {!!m.text && <Text style={[s.msg, wide && s.msgWide, mine && { color: COLORS.onPrimary }]}>{m.text}{m.editedAt ? <Text style={{ fontSize: 11, opacity: 0.7 }}>{"  (edited)"}</Text> : null}</Text>}
                    {!!m.share && <ShareCard s={m.share} mine={mine} />}
                    <MediaView media={m.media} width={220} />
                    <Text style={[s.time, mine && { color: COLORS.onPrimary, opacity: 0.7 }]}>{clock(m.createdAt)}{mine ? (ms(m.createdAt) <= peerSeen ? wi("  ✓✓ Seen") : wi("  ✓")) : ""}</Text>
                  </TouchableOpacity>
                </HoverMenu>
                <ReactionChips reactions={m.reactions} meUid={me.uid} mine={mine} onPick={(e) => react(m, e)} />
              </SwipeRow>
            );
          })}
      </ScrollView>
      {!!error && <Text style={[s.error, { paddingHorizontal: 14 }]}>{error}</Text>}
      {!!replyTo && (
        <View style={s.replyBar}>
          <View style={{ flex: 1 }}>
            <Text style={s.quoteName}>Replying to {replyTo.from === me.uid ? "yourself" : `@${peer.username}`}</Text>
            <Text style={s.small} numberOfLines={1}>{snippet(replyTo)}</Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)} style={{ padding: 8 }}><Text style={{ color: COLORS.muted, fontSize: 16 }}><Em n="close" /></Text></TouchableOpacity>
        </View>
      )}
      {!!editing && (
        <View style={s.replyBar}>
          <View style={{ flex: 1 }}>
            <Text style={s.quoteName}>Editing message</Text>
            <Text style={s.small} numberOfLines={1}>{editing.text}</Text>
          </View>
          <TouchableOpacity onPress={() => { setEditingId(null); setEditText(""); }} style={{ padding: 8 }}><Text style={{ color: COLORS.muted, fontSize: 16 }}><Em n="close" /></Text></TouchableOpacity>
        </View>
      )}
      {rec.recording || voiceBusy ? (
        <View style={s.composer}>
          <Text style={{ flex: 1, color: COLORS.danger, fontWeight: "800" }}>{voiceBusy ? "Sending voice message…" : `● Recording ${fmt(rec.secs)}`}</Text>
          {!voiceBusy && <TouchableOpacity onPress={() => rec.cancel()} style={{ padding: 10 }}><Text style={{ color: COLORS.muted, fontWeight: "800" }}>Cancel</Text></TouchableOpacity>}
          {!voiceBusy && <TouchableOpacity onPress={sendVoice} style={s.sendBtn}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Send</Text></TouchableOpacity>}
        </View>
      ) : (
        <View style={[s.composer, wide && s.composerWide]}>
          <TouchableOpacity onPress={attach} disabled={sending !== null} style={{ paddingHorizontal: 5, paddingVertical: 6, marginRight: 0 }}>
            {sending !== null ? <Text style={{ color: COLORS.muted, fontSize: 12 }}>{Math.round(sending * 100)}%</Text> : <Text style={{ fontSize: 22 }}><Em n="image" /></Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={attachDoc} disabled={docUp !== null} style={{ paddingHorizontal: 5, paddingVertical: 6, marginRight: 2 }}>
            {docUp !== null ? <Text style={{ color: COLORS.muted, fontSize: 12 }}>{Math.round(docUp * 100)}%</Text> : <Text style={{ fontSize: 22 }}><Em n="paperclip" /></Text>}
          </TouchableOpacity>
          <TextInput value={editing ? editText : text} onChangeText={editing ? setEditText : onType} placeholder={editing ? "Edit message…" : "Message…"} placeholderTextColor={COLORS.muted} maxLength={500} style={[s.chatInput, wide && s.chatInputWide]} onSubmitEditing={editing ? submitEdit : send} returnKeyType="send" autoFocus={!!editing} />
          <TouchableOpacity onPress={editing ? submitEdit : send} disabled={!(editing ? editText : text).trim()} style={[s.sendBtn, !(editing ? editText : text).trim() && { opacity: 0.4 }]}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>{editing ? "Save" : "Send"}</Text></TouchableOpacity>
          {!editing && !text.trim() && (
            <TouchableOpacity onPress={voiceSupported() ? startMic : () => setError("Voice messages work in the web version of the app for now.")} style={{ paddingHorizontal: 4, marginLeft: 4 }}>
              <Text style={{ fontSize: 22 }}><Em n="mic" /></Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setMenu(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 18, padding: 8, width: "100%", maxWidth: 320 }}>
            {!menu?.call && <ReactionPicker current={menu?.reactions?.[me.uid]} onPick={(e) => { const m = menu!; setMenu(null); react(m, e); }} />}
            {[
              ...(menu?.call ? [] : [
                { k: "reply", label: "↩︎  Reply", on: () => setReplyTo(menu) },
                { k: "fwd", label: "↪  Forward", on: () => setFwd({ text: menu!.text, media: menu!.media, share: menu!.share, audio: menu!.audio, doc: menu!.doc }) },
              ]),
              ...(menu?.from === me.uid && !menu?.call ? [
                canEdit(menu) && { k: "edit", label: "✏️  Edit", on: () => { setEditingId(menu!.id); setEditText(menu!.text); } },
                menu.editHistory?.length ? { k: "history", label: "📝 Edit history", on: () => viewEditHistory(menu!) } : false,
              ].filter((a): a is MenuAct => !!a) : []),
              ...(menu?.from === me.uid && canDeleteForAll(menu) ? [{
                k: "delAll",
                label: "🗑  Delete for everyone",
                on: () => {
                  const m = menu!;
                  askLater({
                    title: "Delete this message for everyone?",
                    message: "It will be removed from the conversation for both of you.",
                    run: () => deleteDMForEveryone(id, m.id, m.createdAt).catch(() => setError("Couldn't delete for everyone. It may be more than 3 minutes old.")),
                  });
                },
              }] : []),
              ...(menu ? [{
                k: "del",
                label: "🗑  Delete for me",
                on: () => {
                  const m = menu!;
                  askLater({
                    title: "Delete this message for you?",
                    message: "It will still be visible to your friend.",
                    run: () => deleteDMForMe(id, m.id, me.uid).catch(() => setError("Couldn't delete this message.")),
                  });
                },
              }] : []),
            ].filter((a): a is MenuAct => !!a).map((a) => (
              <TouchableOpacity key={a.k} style={{ padding: 14 }} onPress={() => { const f = a.on; setMenu(null); f(); }}>
                <Text style={{ color: a.k === "del" || a.k === "delAll" ? COLORS.danger : COLORS.text, fontSize: 16, fontWeight: "700" }}>{wi(a.label)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={showEditHistory} transparent animationType="fade" onRequestClose={() => setShowEditHistory(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setShowEditHistory(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 18, padding: 16, width: "100%", maxWidth: 380, maxHeight: "80%" }}>
            <Text style={[s.cardTitle, { marginBottom: 12 }]}>Edit History</Text>
            <ScrollView>
              {editHistory.map((edit, idx) => (
                <View key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottomColor: COLORS.border, borderBottomWidth: idx < editHistory.length - 1 ? 1 : 0 }}>
                  <Text style={[s.small, { marginBottom: 6, color: COLORS.accent, fontWeight: "700" }]}>{clock(edit.editedAt)}</Text>
                  <Text style={[s.msg, { color: COLORS.text }]}>{edit.text}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowEditHistory(false)} style={{ marginTop: 12, paddingVertical: 12, alignItems: "center", borderTopColor: COLORS.border, borderTopWidth: 1 }}>
              <Text style={{ color: COLORS.accent, fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <ConfirmModal ask={ask} onClose={() => setAsk(null)} />
      <ShareSheet forward={fwd} onClose={() => setFwd(null)} />
      <PhotoZoom pic={zoom} onClose={() => setZoom(null)} />
    </KeyboardAvoidingView>
  );
}

// Swipe a message to the right to reply to it (mostly horizontal drags only, so scrolling still works).
export function SwipeRow({ children, onReply, style, maxW = "86%" }: { children: React.ReactNode; onReply: () => void; style?: any; maxW?: any }) {
  const x = useRef(new Animated.Value(0)).current;
  const reply = useRef(onReply); reply.current = onReply;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dx > 12 && g.dx > Math.abs(g.dy) * 1.6,
    onPanResponderMove: (_, g) => x.setValue(Math.max(0, Math.min(g.dx, 90))),
    onPanResponderRelease: (_, g) => { if (g.dx > 60) reply.current(); Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start(); },
    onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: false }).start(),
  })).current;
  const icon = x.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: "clamp" });
  return (
    <View style={style}>
      <Animated.View style={{ position: "absolute", left: 6, top: 0, bottom: 0, justifyContent: "center", opacity: icon }}><Text style={{ fontSize: 20 }}>↩️</Text></Animated.View>
      <Animated.View {...pan.panHandlers} style={[{ transform: [{ translateX: x }], maxWidth: maxW }, (StyleSheet.flatten(style) as any)?.alignItems === "flex-end" && { alignSelf: "flex-end" }]}>{children}</Animated.View>
    </View>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flex: 1 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "800", marginBottom: 6 },
  sub: { color: COLORS.muted, marginBottom: 14, lineHeight: 20 },
  back: { color: COLORS.accent, fontWeight: "800", fontSize: 18, marginRight: 12 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  small: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  error: { color: COLORS.danger, marginVertical: 8 },
  newBtn: { backgroundColor: COLORS.primary, borderRadius: 999, alignItems: "center", paddingVertical: 14, marginBottom: 14 },
  chatHead: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "web" ? 14 : 48, paddingHorizontal: 12, paddingBottom: 10, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  callRow: { flexDirection: "row", alignItems: "center", alignSelf: "center", backgroundColor: COLORS.card, borderWidth: 1, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, marginVertical: 8, maxWidth: "88%" },
  bubbleRow: { marginBottom: 8, alignItems: "flex-start" },
  bubble: { backgroundColor: COLORS.card, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  bubbleWide: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 18 },
  msgWide: { fontSize: 16, lineHeight: 23 },
  composerWide: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18 },
  chatInputWide: { paddingVertical: 13, paddingHorizontal: 18, fontSize: 16 },
  bubbleMine: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  msg: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  time: { color: COLORS.muted, fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  composer: { flexDirection: "row", padding: 8, paddingBottom: 12, borderTopColor: COLORS.border, borderTopWidth: 1, alignItems: "center" },
  chatInput: { flex: 1, minWidth: 0, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 20, color: COLORS.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginRight: 8 },
  fwdLbl: { color: COLORS.muted, fontSize: 11, fontStyle: "italic", marginBottom: 4 },
  quote: { backgroundColor: COLORS.bg, borderLeftColor: COLORS.accent, borderLeftWidth: 3, borderRadius: 8, padding: 6, marginBottom: 6 },
  quoteName: { color: COLORS.accent, fontSize: 12, fontWeight: "800" },
  replyBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, borderTopColor: COLORS.border, borderTopWidth: 1 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 11 },
  editLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 6,
    fontStyle: "italic",
  },
  editingContainer: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
});