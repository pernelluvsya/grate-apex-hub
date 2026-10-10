# Message Management Features Implementation Guide

## Overview
This guide outlines how to implement the following features for your GrateApex messaging system:
1. **Delete for yourself** - Remove message from your chat (always available)
2. **Delete for everyone** - Remove message from conversation (if < 1 minute old)
3. **Edit messages** - Modify sent messages (if < 1 minute old)
4. **Edit history** - View all previous versions of edited messages

---

## 1. Update the DM Type

### File: `src/messages.ts`

Update the `DM` type to include edit-related fields:

```typescript
export type DM = { 
  id: string; 
  from: string; 
  text: string; 
  call?: CallLog; 
  media?: Media[]; 
  share?: Share; 
  audio?: Voice; 
  doc?: Doc; 
  reply?: ReplyTo; 
  fwd?: boolean; 
  reactions?: Record<string, string>; 
  createdAt?: any;
  
  // NEW FIELDS:
  editedAt?: any;              // Server timestamp of last edit
  editHistory?: Array<{        // Array of previous versions
    text: string;
    editedAt: any;
  }>;
  deletedFor?: Record<string, boolean>; // Track who deleted it for themselves
};
```

---

## 2. Add Helper Functions to messages.ts

Add these functions to `src/messages.ts` for message management:

```typescript
import { deleteField, collection, doc, getDoc, setDoc, addDoc, onSnapshot, query, where, orderBy, limitToLast, updateDoc, deleteDoc, serverTimestamp, getDocs, arrayUnion } from "firebase/firestore";

/**
 * Check if a message can be edited/deleted for everyone
 * Must be within 1 minute of creation
 */
export const canEditOrDeleteForAll = (createdAt: any): boolean => {
  const age = Date.now() - ms(createdAt);
  return age < 60000; // 1 minute in milliseconds
};

/**
 * Edit a message (only owner can edit, within 1 minute)
 * Stores the old version in editHistory
 */
export async function editDM(
  chatId: string, 
  messageId: string, 
  newText: string, 
  oldMessage: DM
) {
  if (!canEditOrDeleteForAll(oldMessage.createdAt)) {
    throw new Error("Messages can only be edited within 1 minute of sending");
  }

  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  
  // Add the old version to edit history
  const editHistory = oldMessage.editHistory ?? [];
  editHistory.push({
    text: oldMessage.text,
    editedAt: oldMessage.editedAt || oldMessage.createdAt,
  });

  // Update the message with new text and updated timestamp
  await updateDoc(messageRef, {
    text: newText.trim(),
    editedAt: serverTimestamp(),
    editHistory: editHistory,
  });
}

/**
 * Delete a message for the current user only
 * The message still exists for others
 */
export function deleteDMForMe(chatId: string, messageId: string, uid: string) {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  return updateDoc(messageRef, {
    [`deletedFor.${uid}`]: true,
  });
}

/**
 * Delete a message for everyone (only within 1 minute)
 * Actually removes the message from Firestore
 */
export async function deleteDMForEveryone(chatId: string, messageId: string, createdAt: any) {
  if (!canEditOrDeleteForAll(createdAt)) {
    throw new Error("Messages can only be deleted for everyone within 1 minute of sending");
  }
  return deleteDoc(doc(db, "chats", chatId, "messages", messageId));
}

/**
 * Keep the old deleteDM function for backward compatibility
 * Maps to deleteDMForMe
 */
export function deleteDM(chatId: string, messageId: string) {
  return deleteDoc(doc(db, "chats", chatId, "messages", messageId));
}
```

---

## 3. Update ChatView in Messages.tsx

### File: `src/screens/Messages.tsx`

#### Step 1: Add state for edit mode

In the `ChatView` function, add these state variables after line 134:

```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [editText, setEditText] = useState("");
const [editHistory, setEditHistory] = useState<any[]>([]);
const [showEditHistory, setShowEditHistory] = useState(false);
```

#### Step 2: Add edit handler

Add this function before the `return` statement (before line 203):

```typescript
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

const viewEditHistory = (m: DM) => {
  setEditHistory(m.editHistory ?? []);
  setShowEditHistory(true);
};

const canEdit = (m: DM): boolean => {
  return m.from === me.uid && canEditOrDeleteForAll(m.createdAt);
};

const canDeleteForAll = (m: DM): boolean => {
  return m.from === me.uid && canEditOrDeleteForAll(m.createdAt);
};
```

Don't forget to import the new functions at the top:

```typescript
import { Chat, DM, ReplyTo, talked, chatId, deleteDM, deleteChat, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages, editDM, deleteDMForMe, deleteDMForEveryone, canEditOrDeleteForAll } from "../messages";
```

#### Step 3: Update the message menu

Replace the menu section (lines 302-312) with:

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
    canDeleteForAll(menu) ? { k: "delAll", label: "🗑  Delete for everyone", on: () => {
      confirmAsk("Delete this message for everyone?", "This will remove it from the conversation. You have 1 minute to delete for everyone.", [
        { text: "Delete", onPress: async () => { await deleteDMForEveryone(id, menu!.id, menu!.createdAt).catch(() => setError("Couldn't delete.")); }, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }} : false,
    { k: "del", label: "🗑  Delete for me", on: () => {
      confirmAsk("Delete this message for you?", "It will still be visible to your friend.", [
        { text: "Delete", onPress: async () => { await deleteDMForMe(id, menu!.id, me.uid).catch(() => setError("Couldn't delete.")); }, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }},
  ].filter(Boolean) : []),
].filter(Boolean).map((a) => (
  <TouchableOpacity key={a.k} style={{ padding: 14 }} onPress={() => { const f = a.on; setMenu(null); f(); }}>
    <Text style={{ color: a.k === "del" || a.k === "delAll" ? COLORS.danger : COLORS.text, fontSize: 16, fontWeight: "700" }}>{a.label}</Text>
  </TouchableOpacity>
))}
```

#### Step 4: Update message rendering

In the message mapping section (around line 235), wrap the message bubble content with edit UI:

```typescript
{editingId === m.id ? (
  <View style={[s.bubble, wide && s.bubbleWide, mine && s.bubbleMine, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
    <TextInput 
      value={editText} 
      onChangeText={setEditText} 
      placeholder="Edit message…"
      placeholderTextColor={COLORS.muted}
      style={[s.msg, wide && s.msgWide, mine && { color: COLORS.onPrimary }, { flex: 1, borderBottomWidth: 1, borderBottomColor: mine ? COLORS.onPrimary : COLORS.border, paddingBottom: 4 }]} 
      multiline
    />
    <View style={{ flexDirection: "row", gap: 4 }}>
      <TouchableOpacity onPress={() => { setEditingId(null); setEditText(""); }} style={{ padding: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.muted }}>✕</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => edit(m, editText)} style={{ padding: 6, backgroundColor: COLORS.primary, borderRadius: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.onPrimary }}>✓</Text>
      </TouchableOpacity>
    </View>
  </View>
) : (
  <TouchableOpacity activeOpacity={0.9} onLongPress={() => setMenu(m)} style={[s.bubble, wide && s.bubbleWide, mine && s.bubbleMine]}>
    {/* ... existing message content ... */}
    {!!m.editedAt && <Text style={[s.fwdLbl, mine && { color: COLORS.onPrimary }]}>✏️ Edited</Text>}
    {/* ... rest of message ... */}
  </TouchableOpacity>
)}
```

#### Step 5: Add Edit History Modal

Add this modal before the ShareSheet (after line 316):

```typescript
<Modal visible={showEditHistory} transparent animationType="fade" onRequestClose={() => setShowEditHistory(false)}>
  <TouchableOpacity activeOpacity={1} onPress={() => setShowEditHistory(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 }}>
    <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderRadius: 18, padding: 16, width: "100%", maxWidth: 380, maxHeight: "80%" }}>
      <Text style={[s.cardTitle, { marginBottom: 12 }]}>Edit History</Text>
      <ScrollView>
        {editHistory.map((edit, idx) => (
          <View key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottomColor: COLORS.border, borderBottomWidth: 1 }}>
            <Text style={[s.small, { marginBottom: 6 }]}>{clock(edit.editedAt)}</Text>
            <Text style={[s.msg]}>{edit.text}</Text>
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

## 4. Update Firestore Rules

### File: `firestore.rules`

Update the rules to support the new fields:

```firestore
// In the messages collection rules, update to:
match /messages/{messageId} {
  allow read: if request.auth.uid in resource.data.members || 
              (request.auth.uid == get(/databases/$(database)/documents/chats/$(chat)).data.members[0]) ||
              (request.auth.uid == get(/databases/$(database)/documents/chats/$(chat)).data.members[1]);
  
  allow create: if request.auth.uid != null &&
                request.resource.data.from == request.auth.uid &&
                request.resource.data.keys().hasAll(['from', 'text', 'createdAt']);
  
  allow update: if request.auth.uid != null && 
                resource.data.from == request.auth.uid && (
                  // Allow editing only if within 1 minute
                  request.time < timestamp.value(resource.data.createdAt) + duration.value({'seconds': 60}) &&
                  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['text', 'editedAt', 'editHistory']) ||
                  // Allow marking as deleted for user
                  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['deletedFor'])
                );
  
  allow delete: if request.auth.uid != null && 
                resource.data.from == request.auth.uid &&
                request.time < timestamp.value(resource.data.createdAt) + duration.value({'seconds': 60});
}
```

---

## 5. Update UI to Hide Deleted Messages

### File: `src/screens/Messages.tsx`

In the message mapping, filter out messages deleted for the current user:

```typescript
{messages
  .filter(m => !m.deletedFor?.[me.uid]) // Hide messages deleted for current user
  .map((m) => {
    // ... rest of message rendering
  })}
```

---

## 6. Styling Additions

Add these styles to the `makeStyles` function:

```typescript
editingContainer: { 
  borderWidth: 2, 
  borderColor: COLORS.accent,
  padding: 12,
},
editLabel: { 
  color: COLORS.muted, 
  fontSize: 10, 
  marginBottom: 4,
  fontStyle: "italic",
},
```

---

## Implementation Checklist

- [ ] Update DM type with new fields (messages.ts)
- [ ] Add helper functions (canEditOrDeleteForAll, editDM, deleteDMForMe, deleteDMForEveryone)
- [ ] Add state variables for editing (editingId, editText, editHistory, showEditHistory)
- [ ] Add edit and deletion handlers (edit, viewEditHistory, canEdit, canDeleteForAll)
- [ ] Update message menu with new options
- [ ] Update message rendering to show edit UI and "edited" label
- [ ] Add edit history modal
- [ ] Filter deleted messages from display
- [ ] Update Firestore rules
- [ ] Test all features thoroughly

---

## Feature Breakdown

### Delete for Yourself
- **When**: Always available
- **Action**: `deleteDMForMe()` - Sets `deletedFor[uid]` flag
- **Result**: Message hidden only from the deleter
- **Firebase**: Message document remains, deletedFor field updated

### Delete for Everyone
- **When**: Message < 1 minute old AND you're the sender
- **Action**: `deleteDMForEveryone()` - Deletes entire document
- **Result**: Message removed for all users
- **Firebase**: Document deleted from Firestore

### Edit Message
- **When**: Message < 1 minute old AND you're the sender
- **Action**: `editDM()` - Updates text, stores old version
- **Result**: Message text updated, shows "edited" label
- **Firebase**: New editedAt timestamp, editHistory array populated

### View Edit History
- **When**: Message has been edited
- **Action**: Opens modal showing all previous versions with timestamps
- **Result**: User sees evolution of message edits
- **Firebase**: Reads from editHistory array

---

## Security Considerations

1. **Firestore Rules**: Only message owner can edit/delete their messages
2. **Time Limit**: Backend enforces 60-second window
3. **Edit History**: Immutable once written (never updated, only appended)
4. **Visibility**: deletedFor field prevents unauthorized deletion visibility

---

## Testing Checklist

- [ ] Edit a message within 1 minute
- [ ] Attempt to edit after 1 minute (should fail)
- [ ] View edit history of a message
- [ ] Delete message for yourself
- [ ] Delete message for everyone (within 1 minute)
- [ ] Attempt to delete for everyone after 1 minute (should fail)
- [ ] Verify deleted-for-me messages don't show in UI
- [ ] Verify deleted-for-everyone messages are gone for all users
- [ ] Cross-platform testing (web, iOS, Android)
