import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, TextInput } from "../Text";
import { SkeletonGroup, SkeletonCard, SkeletonRow } from "../Skeleton";
import { useAuth } from "../auth";
import { useProfileHost, ProfileHost } from "../profileHost";
import { useColors, Colors } from "../theme";
import { Button, Chip, Column, HoverMenu } from "../ui";
import Background from "../Background";
import { Me, clock } from "../community";
import { MediaView, Avatar } from "../MediaUI";
import { usePhotos } from "../photos";
import ShareCard from "../ShareCard";
import ShareSheet, { Fwd } from "../ShareSheet";
import { DocCard, pickAndUploadDoc } from "../docs";
import { ReactionChips, ReactionPicker } from "../reactions";
import { ReplyTo, snippet, EditEntry, canEditOrDeleteForAll } from "../messages";
import { SwipeRow, ConfirmModal } from "./Messages";
import type { Ask } from "./Messages";
import { VoiceBubble, fmt, uploadVoice, useVoiceRecorder, voiceSupported } from "../voice";
import { Media, pickAndUpload } from "../media";
import { UserHit, fetchEdges } from "../social";
import {
  Group, LeftGroup, Message, MAX_MEMBERS, createGroup, listMyGroups, addMember, leaveGroup, deleteGroup, listLeftGroups, deleteLeftGroup,
  subscribeGroup, subscribeMessages, sendMessage, reactMessage, editMessage, deleteMessageForMe, deleteMessageForEveryone,
} from "../groups";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

// Friends = people I follow who also follow me.
async function fetchFriends(uid: string): Promise<UserHit[]> {
  const [fg, fr] = await Promise.all([fetchEdges(uid, "following"), fetchEdges(uid, "followers")]);
  const back = new Set(fr.map((u) => u.uid));
  return fg.filter((u) => back.has(u.uid));
}

export default function GroupsView({ onBack }: { onBack: () => void }) {
  const { user, profile } = useAuth();
  const me: Me | null = user && profile ? { uid: user.uid, username: profile.username } : null;
  const [view, setView] = useState<"list" | "create">("list");
  const [open, setOpen] = useState<Group | null>(null);
  const [refresh, setRefresh] = useState(0);
  // Closing a chat reloads the list, so a group you just deleted or left disappears straight away.
  const close = () => { setOpen(null); setRefresh((n) => n + 1); };
  if (!me) return null;
  // The chat opens full-screen in a Modal (like private messages) so it covers the floating tab bar
  // and the message box sits at the very bottom of the screen instead of behind the nav.
  return (
    <>
      {view === "create"
        ? <CreateView me={me} onBack={() => setView("list")} onCreated={(g) => { setView("list"); setOpen(g); }} />
        : <ListView me={me} refresh={refresh} onBack={onBack} onCreate={() => setView("create")} onOpen={setOpen} />}
      <Modal visible={!!open} animationType="slide" onRequestClose={close}>
        {open && <ProfileHost><Background><Column max={980}><ChatView key={open.id} group={open} me={me} onBack={close} /></Column></Background></ProfileHost>}
      </Modal>
    </>
  );
}

// ---------- my groups ----------
function ListView({ me, refresh, onBack, onCreate, onOpen }: { me: Me; refresh: number; onBack: () => void; onCreate: () => void; onOpen: (g: Group) => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [left, setLeft] = useState<LeftGroup[]>([]);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const mine = (await listMyGroups(me.uid)).sort((a, b) => a.name.localeCompare(b.name));
      setGroups(mine);
      // groups I left (skip any I've since been added back to)
      const gone = await listLeftGroups(me.uid).catch(() => [] as LeftGroup[]);
      setLeft(gone.filter((l) => !mine.some((g) => g.id === l.id)).sort((a, b) => a.name.localeCompare(b.name)));
    }
    catch (e: any) { setError(`Couldn't load groups (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); }
    finally { setLoading(false); }
  }, [me.uid]);
  useEffect(() => { load(); }, [load, refresh]);

  return (
    <ScrollView style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 }}>
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ All boards</Text></TouchableOpacity>
      <Text style={s.title}><Em n="users" /> Study groups</Text>
      <Text style={s.sub}>Private chats with friends. You can only add people you follow and who follow you back.</Text>
      <Button title="＋ Create a group" onPress={onCreate} />
      {!!error && <Text style={s.error}>{error}</Text>}
      {loading && groups.length === 0 && (
        <SkeletonGroup>{[0, 1, 2].map((i) => <SkeletonCard key={i} lines={1} />)}</SkeletonGroup>
      )}
      {!loading && groups.length === 0 && !error && <Text style={[s.small, { marginTop: 14 }]}>You're not in any groups yet.</Text>}
      <View style={{ height: 10 }} />
      {groups.map((g) => (
        <TouchableOpacity key={g.id} style={s.card} onPress={() => onOpen(g)}>
          <Text style={s.cardTitle}>{g.name}</Text>
          {!!g.description && <Text style={s.small} numberOfLines={2}>{g.description}</Text>}
          <Text style={[s.small, { marginTop: 6 }]}>👥 {g.memberUids.length} {g.memberUids.length === 1 ? "member" : "members"}{g.ownerUid === me.uid ? " · you own this" : ""}</Text>
        </TouchableOpacity>
      ))}
      {left.length > 0 && (
        <>
          <Text style={[s.cardTitle, { marginTop: 18, marginBottom: 6 }]}>Groups you left</Text>
          {left.map((l) => (
            <View key={l.id} style={[s.card, { flexDirection: "row", alignItems: "center" }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle} numberOfLines={1}>{l.name}</Text>
                <Text style={s.small}>You left this group</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAsk({
                  title: `Delete chat "${l.name}"?`,
                  message: "You're no longer in this group. This removes it from your list.",
                  label: "Delete",
                  run: () => deleteLeftGroup(me.uid, l.id)
                    .then(() => setLeft((cur) => cur.filter((x) => x.id !== l.id)))
                    .catch((e: any) => setError(`Couldn't delete this chat (${e?.code ?? "unknown"}).`)),
                })}
                style={{ paddingVertical: 8, paddingHorizontal: 10 }}>
                <Text style={{ color: COLORS.danger, fontWeight: "800" }}><Em n="trash" /> Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
      <ConfirmModal ask={ask} onClose={() => setAsk(null)} />
    </ScrollView>
  );
}

// ---------- create ----------
function CreateView({ me, onBack, onCreated }: { me: Me; onBack: () => void; onCreated: (g: Group) => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [friends, setFriends] = useState<UserHit[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchFriends(me.uid).then(setFriends).catch(() => { }).finally(() => setLoading(false)); }, [me.uid]);

  const toggle = (u: UserHit) => {
    const n = new Set(picked);
    if (n.has(u.uid)) n.delete(u.uid);
    else if (n.size + 1 < MAX_MEMBERS) n.add(u.uid);
    setPicked(n);
  };

  const submit = async () => {
    if (name.trim().length < 2) { setError("Give your group a name."); return; }
    setBusy(true); setError("");
    try {
      const id = await createGroup(name, desc, me);
      const members: Record<string, string> = { [me.uid]: me.username };
      const added: string[] = [me.uid];
      for (const f of friends.filter((x) => picked.has(x.uid))) {
        try { await addMember(id, f.uid, f.username); members[f.uid] = f.username; added.push(f.uid); } catch { /* skip anyone the server refuses */ }
      }
      onCreated({ id, name: name.trim(), description: desc.trim(), ownerUid: me.uid, ownerName: me.username, memberUids: added, members });
    } catch (e: any) { setError(`Couldn't create (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); setBusy(false); }
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Cancel</Text></TouchableOpacity>
      <Text style={s.title}>New group</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Group name (e.g. Biochem Night Owls)" placeholderTextColor={COLORS.muted} maxLength={40} style={s.input} />
      <TextInput value={desc} onChangeText={setDesc} placeholder="What's it for? (optional)" placeholderTextColor={COLORS.muted} maxLength={200} style={s.input} />
      <Text style={[s.cardTitle, { marginTop: 8 }]}>Add friends</Text>
      {loading && (
        <SkeletonGroup>{[0, 1, 2].map((i) => <SkeletonRow key={i} avatar={38} />)}</SkeletonGroup>
      )}
      {!loading && friends.length === 0 && (
        <Text style={s.small}>No friends yet. Friends are people you follow who follow you back. Find classmates in Compete → Find.</Text>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        {friends.map((f) => <Chip key={f.uid} label={`@${f.username}`} selected={picked.has(f.uid)} onPress={() => toggle(f)} />)}
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
      <View style={{ height: 8 }} />
      <Button title="Create group" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

// ---------- live chat ----------
function ChatView({ group: initial, me, onBack }: { group: Group; me: Me; onBack: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { open: openProfile } = useProfileHost();
  const [group, setGroup] = useState<Group>(initial);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(false);
  const [friends, setFriends] = useState<UserHit[]>([]);
  const photos = usePhotos([...group.memberUids, ...friends.map((f) => f.uid)]);
  const scroller = useRef<ScrollView>(null);
  const isOwner = group.ownerUid === me.uid;

  useEffect(() => {
    const u1 = subscribeGroup(initial.id, (g) => { if (g) setGroup(g); else onBack(); }, (e) => setError(`Group error (${e?.code ?? "unknown"}).`));
    const u2 = subscribeMessages(initial.id, setMessages, (e) => setError(`Chat error (${e?.code ?? "unknown"}). ${e?.message ?? ""}`));
    return () => { u1(); u2(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.id]);

  useEffect(() => { if (panel && isOwner) fetchFriends(me.uid).then(setFriends).catch(() => { }); }, [panel, isOwner, me.uid]);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const quote = (m: Message | null): ReplyTo | undefined => m ? { id: m.id, from: m.authorUid, name: m.authorName, text: snippet(m) } : undefined;
  const takeReply = () => { const r = quote(replyTo); setReplyTo(null); return r ? { reply: r } : {}; };
  const [sending, setSending] = useState<number | null>(null);
  const [docUp, setDocUp] = useState<number | null>(null);
  const attachDoc = async () => {
    setError(""); setDocUp(0);
    try { const d = await pickAndUploadDoc(setDocUp); if (d) await sendMessage(group.id, "", me, undefined, undefined, { doc: d, ...takeReply() }); }
    catch (e: any) { setError(e?.message ?? "Couldn't send that document."); }
    finally { setDocUp(null); }
  };
  const [menu, setMenu] = useState<Message | null>(null);
  const react = (m: Message, e: string | null) => { reactMessage(group.id, m.id, me.uid, e).catch(() => setError("Couldn't react. Publish the latest Firestore rules.")); };
  const [ask, setAsk] = useState<Ask | null>(null);
  const askLater = (a: Ask) => { setTimeout(() => setAsk(a), 200); }; // lets the message menu finish closing first
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editHistory, setEditHistory] = useState<EditEntry[]>([]);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const editing = editingId ? messages.find((m) => m.id === editingId) ?? null : null;
  const edit = async (m: Message, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed || trimmed === m.text) { setEditingId(null); setEditText(""); return; }
    try { await editMessage(group.id, m.id, trimmed, m); setEditingId(null); setEditText(""); }
    catch (e: any) {
      console.error("editMessage failed", e);
      if (e?.code === "permission-denied") { setEditingId(null); setEditText(""); }
      setError(e?.code === "permission-denied" ? "Couldn't save the edit (permission-denied). Edits only work within 3 minutes, and the latest Firestore rules must be published." : `Couldn't edit the message (${e?.code ?? e?.message ?? "error"}).`);
    }
  };
  const submitEdit = () => { if (editing) edit(editing, editText); };
  const [fwd, setFwd] = useState<Fwd | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const rec = useVoiceRecorder();
  const sendVoice = async () => {
    const r = await rec.send(); if (!r) return;
    setVoiceBusy(true);
    try { const audio = await uploadVoice(r.blob, r.d); await sendMessage(group.id, "", me, undefined, undefined, { audio, ...takeReply() }); }
    catch (e: any) { setError(e?.message ?? "Couldn't send the voice message."); }
    setVoiceBusy(false);
  };
  const send = async () => {
    const t = text.trim();
    if (!t) return;
    const rt = replyTo;
    setText(""); setError("");
    try { await sendMessage(group.id, t, me, undefined, undefined, takeReply()); }
    catch (e: any) { setText(t); setReplyTo(rt); setError(`Couldn't send (${e?.code ?? "unknown"}).`); }
  };
  // Pick a photo/video, upload it, and send it straight away as its own message.
  const attach = async () => {
    setError(""); setSending(0);
    try {
      const m: Media | null = await pickAndUpload({ onProgress: setSending });
      if (m) await sendMessage(group.id, "", me, [m], undefined, takeReply());
    } catch (e: any) { setError(e?.message ?? "Couldn't send that."); }
    finally { setSending(null); }
  };

  const add = async (f: UserHit) => {
    try { await addMember(group.id, f.uid, f.username); setError(""); }
    catch (e: any) { setError(`Couldn't add @${f.username} (${e?.code ?? "unknown"}).`); }
  };
  const leave = async () => { try { await leaveGroup(group, me.uid); onBack(); } catch (e: any) { setError(`Couldn't leave (${e?.code ?? "unknown"}).`); } };
  const remove = async () => { try { await deleteGroup(group.id); onBack(); } catch (e: any) { setError(`Couldn't delete (${e?.code ?? "unknown"}).`); } };
  const confirmLeave = () => { setPanel(false); askLater({ title: "Leave this group?", message: "Everyone in the group will see that you left.", label: "Leave", run: leave }); };
  const confirmRemove = () => { setPanel(false); askLater({ title: "Delete this group?", message: "The group and its chat will be removed for everyone.", label: "Delete", run: remove }); };
  const viewProfile = (uid: string) => { setPanel(false); setTimeout(() => openProfile(uid, group.members[uid]), 200); };
  // owner first, then you, then everyone else A-Z
  const orderedMembers = [...group.memberUids].sort((a, b) => {
    const rank = (u: string) => (u === group.ownerUid ? 0 : u === me.uid ? 1 : 2);
    return rank(a) - rank(b) || (group.members[a] ?? "").localeCompare(group.members[b] ?? "");
  });

  const visible = messages.filter((m) => !m.deletedFor?.[me.uid]);
  const canAdd = friends.filter((f) => !group.memberUids.includes(f.uid));
  const full = group.memberUids.length >= MAX_MEMBERS;

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.chatHead}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>‹</Text></TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setPanel(!panel)}>
          <Text style={s.cardTitle} numberOfLines={1}>{group.name}</Text>
          <Text style={s.small}>👥 {group.memberUids.length} {group.memberUids.length === 1 ? "member" : "members"} · tap for details</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={panel} transparent animationType="fade" onRequestClose={() => setPanel(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setPanel(false)} style={s.backdrop}>
          <TouchableOpacity activeOpacity={1} style={s.sheet}>
            <View style={s.sheetHead}>
              <View style={s.groupBadge}><Text style={{ fontSize: 22 }}><Em n="users" /></Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle} numberOfLines={2}>{group.name}</Text>
                <Text style={s.small}>{group.memberUids.length} of {MAX_MEMBERS} members</Text>
              </View>
              <TouchableOpacity onPress={() => setPanel(false)} style={s.closeBtn}><Text style={{ color: COLORS.muted, fontSize: 16, fontWeight: "800" }}><Em n="close" /></Text></TouchableOpacity>
            </View>
            {!!group.description && <Text style={s.sheetDesc}>{group.description}</Text>}

            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
              <Text style={s.sectionLabel}>MEMBERS</Text>
              {orderedMembers.map((uid) => {
                const name = group.members[uid] ?? "student";
                return (
                  <TouchableOpacity key={uid} activeOpacity={0.7} onPress={() => viewProfile(uid)} style={s.memberRow}>
                    <Avatar name={name} photo={photos[uid]} size={40} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: 15 }} numberOfLines={1}>@{name}</Text>
                    </View>
                    {uid === me.uid && <View style={s.tag}><Text style={s.tagText}>You</Text></View>}
                    {uid === group.ownerUid && <View style={[s.tag, s.tagOwner]}><Text style={[s.tagText, { color: COLORS.accent }]}><Em n="crown" /> Owner</Text></View>}
                  </TouchableOpacity>
                );
              })}

              {isOwner && !full && canAdd.length > 0 && (
                <>
                  <Text style={[s.sectionLabel, { marginTop: 16 }]}>ADD A FRIEND</Text>
                  {canAdd.map((f) => (
                    <View key={f.uid} style={s.memberRow}>
                      <Avatar name={f.username} photo={photos[f.uid]} size={40} />
                      <Text style={{ flex: 1, marginLeft: 12, color: COLORS.text, fontWeight: "700", fontSize: 15 }} numberOfLines={1}>@{f.username}</Text>
                      <TouchableOpacity onPress={() => add(f)} style={s.addBtn}><Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 13 }}>＋ Add</Text></TouchableOpacity>
                    </View>
                  ))}
                </>
              )}
              {isOwner && full && <Text style={[s.small, { marginTop: 14 }]}>This group is full ({MAX_MEMBERS} members).</Text>}
              {isOwner && !full && canAdd.length === 0 && <Text style={[s.small, { marginTop: 14 }]}>You can add friends (people you follow who follow you back).</Text>}
            </ScrollView>

            {!!error && <Text style={[s.error, { marginBottom: 0 }]}>{error}</Text>}
            <TouchableOpacity onPress={isOwner ? confirmRemove : confirmLeave} style={s.dangerBtn}>
              <Text style={{ color: COLORS.danger, fontWeight: "800", fontSize: 15 }}>{isOwner ? wi("🗑  Delete group") : wi("🚪  Leave group")}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
        {visible.length === 0 && <Text style={[s.small, { textAlign: "center", marginTop: 30 }]}>No messages yet. Say hi </Text>}
        {visible.map((m) => {
          if (m.system) {
            return (
              <View key={m.id} style={{ alignItems: "center", marginVertical: 8, paddingHorizontal: 12 }}>
                <Text style={[s.small, { textAlign: "center", fontStyle: "italic" }]}>{m.text}</Text>
              </View>
            );
          }
          const mine = m.authorUid === me.uid;
          return (
            <SwipeRow key={m.id} maxW="82%" onReply={() => setReplyTo(m)} style={[s.bubbleRow, mine && { alignItems: "flex-end" }]}>
              <HoverMenu mine={mine} onMenu={() => setMenu(m)} maxW="100%">
                <TouchableOpacity activeOpacity={0.9} onLongPress={() => setMenu(m)} style={[s.bubble, mine && s.bubbleMine, { maxWidth: "100%" }]}>
                  {m.fwd && <Text style={{ color: mine ? COLORS.onPrimary : COLORS.muted, fontSize: 11, fontStyle: "italic", marginBottom: 4 }}>↪ Forwarded</Text>}
                  {!mine && <Text style={s.author}>@{m.authorName}</Text>}
                  {!!m.reply && (
                    <View style={[s.quote, mine && { backgroundColor: "rgba(255,255,255,0.18)", borderLeftColor: COLORS.onPrimary }]}>
                      <Text style={[s.quoteName, mine && { color: COLORS.onPrimary }]}>{m.reply.from === me.uid ? "You" : `@${m.reply.name}`}</Text>
                      <Text style={[s.small, mine && { color: COLORS.onPrimary, opacity: 0.8 }]} numberOfLines={2}>{m.reply.text}</Text>
                    </View>
                  )}
                  {!!m.text && <Text style={[s.msg, mine && { color: COLORS.onPrimary }]}>{m.text}{m.editedAt ? <Text style={{ fontSize: 11, opacity: 0.7 }}>{"  (edited)"}</Text> : null}</Text>}
                  {!!m.audio && <VoiceBubble v={m.audio} mine={mine} />}
                  {!!m.doc && <DocCard d={m.doc} mine={mine} />}
                  {!!m.share && <ShareCard s={m.share} mine={mine} />}
                  <MediaView media={m.media} width={220} />
                  <Text style={[s.time, mine && { color: COLORS.onPrimary, opacity: 0.6 }]}>{clock(m.createdAt)}</Text>
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
            <Text style={s.quoteName}>Replying to {replyTo.authorUid === me.uid ? "yourself" : `@${replyTo.authorName}`}</Text>
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
        <View style={s.composer}>
          <TouchableOpacity onPress={attach} disabled={sending !== null} style={{ paddingHorizontal: 8, paddingVertical: 6, marginRight: 4 }}>
            {sending !== null ? <Text style={{ color: COLORS.muted, fontSize: 12 }}>{Math.round(sending * 100)}%</Text> : <Text style={{ fontSize: 22 }}><Em n="image" /></Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={attachDoc} disabled={docUp !== null} style={{ paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 }}>
            {docUp !== null ? <Text style={{ color: COLORS.muted, fontSize: 12 }}>{Math.round(docUp * 100)}%</Text> : <Text style={{ fontSize: 22 }}><Em n="paperclip" /></Text>}
          </TouchableOpacity>
          <TextInput value={editing ? editText : text} onChangeText={editing ? setEditText : setText} placeholder={editing ? "Edit message…" : "Message…"} placeholderTextColor={COLORS.muted} maxLength={500}
            style={s.chatInput} onSubmitEditing={editing ? submitEdit : send} returnKeyType="send" autoFocus={!!editing} />
          <TouchableOpacity onPress={editing ? submitEdit : send} disabled={!(editing ? editText : text).trim()} style={[s.sendBtn, !(editing ? editText : text).trim() && { opacity: 0.4 }]}>
            <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>{editing ? "Save" : "Send"}</Text>
          </TouchableOpacity>
          {!editing && !text.trim() && (
            <TouchableOpacity onPress={voiceSupported() ? () => { setError(""); rec.start().catch((e: any) => setError(e?.message ?? "Couldn't start recording.")); } : () => setError("Voice messages work in the web version of the app for now.")} style={{ paddingHorizontal: 8, marginLeft: 6 }}>
              <Text style={{ fontSize: 22 }}><Em n="mic" /></Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setMenu(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 18, padding: 8, width: "100%", maxWidth: 320 }}>
            <ReactionPicker current={menu?.reactions?.[me.uid]} onPick={(e) => { const m = menu!; setMenu(null); react(m, e); }} />
            <TouchableOpacity style={{ padding: 14 }} onPress={() => { const m = menu!; setMenu(null); setReplyTo(m); }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}>↩︎  Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 14 }} onPress={() => { const m = menu!; setMenu(null); setFwd({ text: m.text, media: m.media, share: m.share, audio: m.audio, doc: m.doc }); }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}>↪  Forward</Text>
            </TouchableOpacity>
            {!!menu && menu.authorUid === me.uid && !!menu.text && canEditOrDeleteForAll(menu.createdAt) && (
              <TouchableOpacity style={{ padding: 14 }} onPress={() => { const m = menu; setMenu(null); setEditingId(m.id); setEditText(m.text); }}>
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}><Em n="edit" />  Edit</Text>
              </TouchableOpacity>
            )}
            {!!menu?.editHistory?.length && (
              <TouchableOpacity style={{ padding: 14 }} onPress={() => { const m = menu!; setMenu(null); setEditHistory(m.editHistory ?? []); setShowEditHistory(true); }}>
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}><Em n="edit" />  Edit history</Text>
              </TouchableOpacity>
            )}
            {!!menu && menu.authorUid === me.uid && canEditOrDeleteForAll(menu.createdAt) && (
              <TouchableOpacity style={{ padding: 14 }} onPress={() => {
                const m = menu; setMenu(null);
                askLater({
                  title: "Delete this message for everyone?",
                  message: "It will be removed from the group for everyone.",
                  run: () => deleteMessageForEveryone(group.id, m.id, m.createdAt).catch(() => setError("Couldn't delete for everyone. It may be more than 3 minutes old.")),
                });
              }}>
                <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: "700" }}><Em n="trash" />  Delete for everyone</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{ padding: 14 }} onPress={() => {
              const m = menu!; setMenu(null);
              askLater({
                title: "Delete this message for you?",
                message: "It will still be visible to everyone else in the group.",
                run: () => deleteMessageForMe(group.id, m.id, me.uid).catch(() => setError("Couldn't delete this message.")),
              });
            }}>
              <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: "700" }}><Em n="trash" />  Delete for me</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={showEditHistory} transparent animationType="fade" onRequestClose={() => setShowEditHistory(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setShowEditHistory(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 18, padding: 16, width: "100%", maxWidth: 380, maxHeight: "80%" }}>
            <Text style={[s.cardTitle, { marginBottom: 12 }]}>Edit History</Text>
            <ScrollView>
              {editHistory.map((e, idx) => (
                <View key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottomColor: COLORS.border, borderBottomWidth: idx < editHistory.length - 1 ? 1 : 0 }}>
                  <Text style={[s.small, { marginBottom: 6, color: COLORS.accent, fontWeight: "700" }]}>{clock(e.editedAt)}</Text>
                  <Text style={s.msg}>{e.text}</Text>
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
    </KeyboardAvoidingView>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flex: 1 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "800", marginBottom: 6 },
  sub: { color: COLORS.muted, marginBottom: 14, lineHeight: 20 },
  back: { color: COLORS.accent, fontWeight: "800", fontSize: 18, marginRight: 12 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  small: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 14, fontSize: 16, marginBottom: 12 },
  error: { color: COLORS.danger, marginVertical: 8 },
  chatHead: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "web" ? 14 : 52, paddingHorizontal: 16, paddingBottom: 10, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 20 },
  sheet: { backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 22, padding: 18, width: "100%", maxWidth: 380, maxHeight: "85%", borderWidth: 1, borderColor: COLORS.border },
  sheetHead: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  groupBadge: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", marginRight: 12 },
  sheetTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  sheetDesc: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 6, marginBottom: 6 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: COLORS.bg, marginLeft: 6 },
  tagOwner: { borderWidth: 1, borderColor: COLORS.accent },
  tagText: { color: COLORS.muted, fontSize: 11, fontWeight: "800" },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  dangerBtn: { marginTop: 14, paddingVertical: 13, alignItems: "center", borderRadius: 14, borderWidth: 1, borderColor: COLORS.danger },
  bubbleRow: { marginBottom: 8, alignItems: "flex-start" },
  bubble: { maxWidth: "82%", backgroundColor: COLORS.card, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  bubbleMine: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  author: { color: COLORS.accent, fontWeight: "700", fontSize: 12, marginBottom: 2 },
  msg: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  time: { color: COLORS.muted, fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  quote: { backgroundColor: COLORS.bg, borderLeftColor: COLORS.accent, borderLeftWidth: 3, borderRadius: 8, padding: 6, marginBottom: 6 },
  quoteName: { color: COLORS.accent, fontSize: 12, fontWeight: "800" },
  replyBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, borderTopColor: COLORS.border, borderTopWidth: 1 },
  composer: { flexDirection: "row", padding: 10, paddingBottom: 16, borderTopColor: COLORS.border, borderTopWidth: 1, alignItems: "center" },
  chatInput: { flex: 1, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 20, color: COLORS.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginRight: 8 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11 },
});