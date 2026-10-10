# Messages.tsx Changes for Edit and Delete Features

## Overview
This document shows the exact changes needed in `src/screens/Messages.tsx` to implement message editing and deletion features.

---

## Change 1: Update Imports (Line 23)

### Before:
```typescript
import { Chat, DM, ReplyTo, talked, chatId, deleteDM, deleteChat, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages } from "../messages";
```

### After:
```typescript
import { Chat, DM, ReplyTo, talked, chatId, deleteDM, deleteChat, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages, editDM, deleteDMForMe, deleteDMForEveryone, canEditOrDeleteForAll, timeUntilEditLocked } from "../messages";
```

---

## Change 2: Add State Variables (After Line 134)

### Add these new state variables in the `ChatView` function:

```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [editText, setEditText] = useState("");
const [editHistory, setEditHistory] = useState<EditEntry[]>([]);
const [showEditHistory, setShowEditHistory] = useState(false);
```

Also import `EditEntry` at the top:
```typescript
import { Chat, DM, ReplyTo, talked, chatId, deleteDM, deleteChat, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages, editDM, deleteDMForMe, deleteDMForEveryone, canEditOrDeleteForAll, timeUntilEditLocked, EditEntry } from "../messages";
```

---

## Change 3: Add Handler Functions (Before Line 203 - return statement)

### Add these functions before the return statement:

```typescript
/**
 * Handle editing a message.
 */
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
    setError(e?.message ?? "Couldn't edit the message.");
  }
};

/**
 * Show the edit history of a message.
 */
const viewEditHistory = (m: DM) => {
  if (m.editHistory && m.editHistory.length > 0) {
    setEditHistory(m.editHistory);
    setShowEditHistory(true);
  }
};

/**
 * Check if the current user can edit this message.
 */
const canEdit = (m: DM): boolean => {
  return m.from === me.uid && canEditOrDeleteForAll(m.createdAt);
};

/**
 * Check if the current user can delete this message for everyone.
 */
const canDeleteForAll = (m: DM): boolean => {
  return m.from === me.uid && canEditOrDeleteForAll(m.createdAt);
};
```

---

## Change 4: Update Message Filtering (Around Line 215)

### Before:
```typescript
{messages.map((m) => {
```

### After:
```typescript
{messages
  .filter(m => !m.deletedFor?.[me.uid]) // Hide messages deleted for current user
  .map((m) => {
```

---

## Change 5: Update Message Menu (Replace Lines 302-312)

### Before:
```typescript
{[
  ...(menu?.call ? [] : [
    { k: "reply", label: "↩︎  Reply", on: () => setReplyTo(menu) },
    { k: "fwd", label: "↪  Forward", on: () => setFwd({ text: menu!.text, media: menu!.media, share: menu!.share, audio: menu!.audio, doc: menu!.doc }) },
  ]),
  ...(menu?.from === me.uid ? [{ k: "del", label: "🗑  Delete", on: () => remove(menu!) }] : []),
].map((a) => (
  <TouchableOpacity key={a.k} style={{ padding: 14 }} onPress={() => { const f = a.on; setMenu(null); f(); }}>
    <Text style={{ color: a.k === "del" ? COLORS.danger : COLORS.text, fontSize: 16, fontWeight: "700" }}>{a.label}</Text>
  </TouchableOpacity>
))}
```

### After:
```typescript
{[
  ...(menu?.call ? [] : [
    { k: "reply", label: "↩︎  Reply", on: () => setReplyTo(menu) },
    { k: "fwd", label: "↪  Forward", on: () => setFwd({ text: menu!.text, media: menu!.media, share: menu!.share, audio: menu!.audio, doc: menu!.doc }) },
  ]),
  ...(menu?.from === me.uid && !menu?.call ? [
    canEdit(menu) && { k: "edit", label: "✏️  Edit", on: () => { setEditingId(menu!.id); setEditText(menu!.text); } },
    menu.editHistory?.length ? { k: "history", label: "📝 Edit history", on: () => viewEditHistory(menu!) } : false,
  ].filter(Boolean) : []),
  ...(menu?.from === me.uid ? [
    canDeleteForAll(menu) && { 
      k: "delAll", 
      label: "🗑  Delete for everyone", 
      on: () => {
        const time = timeUntilEditLocked(menu!.createdAt);
        confirmAsk(
          "Delete this message for everyone?", 
          time ? `This will remove it from the conversation. You have ${time} to delete for everyone.` : "This will remove it from the conversation. You can no longer delete for everyone.",
          [
            { text: "Delete", onPress: async () => { await deleteDMForEveryone(id, menu!.id, menu!.createdAt).catch(() => setError("Couldn't delete.")); }, style: "destructive" },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
    },
    { 
      k: "del", 
      label: "🗑  Delete for me", 
      on: () => {
        confirmAsk(
          "Delete this message for you?", 
          "It will still be visible to your friend.",
          [
            { text: "Delete", onPress: async () => { await deleteDMForMe(id, menu!.id, me.uid).catch(() => setError("Couldn't delete.")); }, style: "destructive" },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
    },
  ].filter(Boolean) : []),
].filter(Boolean).map((a) => (
  <TouchableOpacity key={a.k} style={{ padding: 14 }} onPress={() => { const f = a.on; setMenu(null); f(); }}>
    <Text style={{ color: a.k === "del" || a.k === "delAll" ? COLORS.danger : COLORS.text, fontSize: 16, fontWeight: "700" }}>{a.label}</Text>
  </TouchableOpacity>
))}
```

---

## Change 6: Update Message Rendering (Replace Lines 235-260)

### Before:
```typescript
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
        {!!m.text && <Text style={[s.msg, wide && s.msgWide, mine && { color: COLORS.onPrimary }]}>{m.text}</Text>}
        {!!m.share && <ShareCard s={m.share} mine={mine} />}
        <MediaView media={m.media} width={220} />
        <Text style={[s.time, mine && { color: COLORS.onPrimary, opacity: 0.7 }]}>{clock(m.createdAt)}{mine ? (ms(m.createdAt) <= peerSeen ? "  ✓✓ Seen" : "  ✓") : ""}</Text>
      </TouchableOpacity>
    </HoverMenu>
    <ReactionChips reactions={m.reactions} meUid={me.uid} mine={mine} onPick={(e) => react(m, e)} />
  </SwipeRow>
);
```

### After:
```typescript
return (
  <SwipeRow key={m.id} maxW={wide ? "68%" : "86%"} onReply={() => setReplyTo(m)} style={[s.bubbleRow, mine && { alignItems: "flex-end" }]}>
    <HoverMenu mine={mine} onMenu={() => setMenu(m)}>
      {editingId === m.id ? (
        // Edit mode UI
        <View style={[s.bubble, wide && s.bubbleWide, mine && s.bubbleMine, { backgroundColor: COLORS.card, borderColor: COLORS.accent, borderWidth: 2 }]}>
          <Text style={[s.editLabel, mine && { color: COLORS.onPrimary }]}>Editing message…</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit message…"
              placeholderTextColor={COLORS.muted}
              style={[
                s.msg,
                wide && s.msgWide,
                mine && { color: COLORS.onPrimary },
                {
                  flex: 1,
                  borderBottomWidth: 1,
                  borderBottomColor: mine ? COLORS.onPrimary : COLORS.border,
                  paddingBottom: 4,
                  paddingRight: 8,
                },
              ]}
              multiline
              maxLength={500}
            />
            <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                style={{ padding: 6 }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.muted }}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => edit(m, editText)}
                style={{ padding: 6, backgroundColor: COLORS.primary, borderRadius: 6 }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.onPrimary }}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Normal message display
        <TouchableOpacity activeOpacity={0.9} onLongPress={() => setMenu(m)} style={[s.bubble, wide && s.bubbleWide, mine && s.bubbleMine]}>
          {m.fwd && <Text style={[s.fwdLbl, mine && { color: COLORS.onPrimary }]}>↪ Forwarded</Text>}
          {!!m.editedAt && (
            <Text style={[s.editLabel, mine && { color: COLORS.onPrimary, opacity: 0.7 }]}>
              ✏️ Edited
              {m.editHistory?.length ? " · Tap menu for history" : ""}
            </Text>
          )}
          {!!m.reply && (
            <View style={[s.quote, mine && { backgroundColor: "rgba(255,255,255,0.18)", borderLeftColor: COLORS.onPrimary }]}>
              {/* Make the reply username clickable to open their profile */}
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
          {!!m.text && <Text style={[s.msg, wide && s.msgWide, mine && { color: COLORS.onPrimary }]}>{m.text}</Text>}
          {!!m.share && <ShareCard s={m.share} mine={mine} />}
          <MediaView media={m.media} width={220} />
          <Text style={[s.time, mine && { color: COLORS.onPrimary, opacity: 0.7 }]}>{clock(m.createdAt)}{mine ? (ms(m.createdAt) <= peerSeen ? "  ✓✓ Seen" : "  ✓") : ""}</Text>
        </TouchableOpacity>
      )}
    </HoverMenu>
    <ReactionChips reactions={m.reactions} meUid={me.uid} mine={mine} onPick={(e) => react(m, e)} />
  </SwipeRow>
);
```

---

## Change 7: Add Edit History Modal (After Line 316)

### Add this code before the `<ShareSheet>` tag:

```typescript
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
```

---

## Change 8: Update Styles (In makeStyles function, add these at the end)

### Add these style definitions to the `makeStyles` function:

```typescript
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
```

---

## Summary of Changes

| Change | Lines | Impact |
|--------|-------|--------|
| Update imports | 23 | Add new edit/delete functions |
| Add state | 134+ | Track editing state and history |
| Add handlers | Before 203 | Handle edit, delete, view history |
| Filter messages | 215 | Hide deleted messages |
| Update menu | 302-312 | Show edit/delete options |
| Update rendering | 235-260 | Show edit UI and edited label |
| Add history modal | After 316 | Display edit history |
| Update styles | makeStyles | Style edit-related UI |

---

## Testing Checklist

- [ ] Edit mode shows when tapping Edit
- [ ] Can cancel edit with ✕ button
- [ ] Can save edit with ✓ button
- [ ] "✏️ Edited" label shows on edited messages
- [ ] Edit history modal displays all versions
- [ ] "Delete for me" hides message for current user only
- [ ] "Delete for everyone" removes message for all (within 1 min)
- [ ] Cannot edit/delete after 1 minute
- [ ] Time counter updates correctly
- [ ] Cross-platform testing passes
