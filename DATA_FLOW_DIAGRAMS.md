# Data Flow & Architecture Diagrams

## 1. Message Edit Flow

```
User Interface
    ↓
[Message Bubble]
    ↓
[Long Press] → [Menu Opens]
    ↓
[Tap "✏️ Edit"]
    ↓
[Enter Edit Mode]
    ├─ Show text input
    ├─ Show ✕ (Cancel) button
    └─ Show ✓ (Save) button
    ↓
[User types new text]
    ↓
[Tap ✓ to Save]
    ↓
editDM(chatId, messageId, newText, oldMessage)
    ├─ Validate: canEditOrDeleteForAll(createdAt)?
    ├─ Create editHistory entry
    ├─ Update message: { text, editedAt, editHistory }
    └─ Send to Firestore
    ↓
[Firebase Rules Check]
    ├─ Is sender == auth.uid? ✓
    ├─ Is createdAt < 60 seconds ago? ✓
    └─ Are changed fields in allowed list? ✓
    ↓
[Update Firestore]
    └─ Message updated in database
    ↓
[Listener Fires]
    └─ watchMessages() updates messages array
    ↓
[UI Updates]
    ├─ Show updated message text
    ├─ Display "✏️ Edited" label
    ├─ Show "📝 Edit history" option in menu
    └─ Clear edit mode UI
```

---

## 2. Delete for Me Flow

```
User Interface
    ↓
[Message Bubble]
    ↓
[Long Press] → [Menu Opens]
    ↓
[Tap "🗑 Delete for me"]
    ↓
[Confirmation Dialog]
    ├─ Title: "Delete this message for you?"
    ├─ Subtitle: "It will still be visible to your friend."
    └─ Options: [Delete] [Cancel]
    ↓
[User Taps "Delete"]
    ↓
deleteDMForMe(chatId, messageId, uid)
    ├─ Update message: { deletedFor[uid]: true }
    └─ Send to Firestore
    ↓
[Firebase Rules Check]
    ├─ Is sender == auth.uid? ✓ (required)
    └─ Modified fields == ['deletedFor']? ✓
    ↓
[Update Firestore]
    └─ deletedFor.currentUserId = true
    ↓
[Listener Fires]
    └─ watchMessages() updates messages array
    ↓
[Filter Applied]
    └─ messages.filter(m => !m.deletedFor[me.uid])
    ↓
[UI Updates]
    └─ Message disappears from your chat view
    ↓
[Other User's View]
    └─ Message still visible (they have no deletedFor flag)
```

---

## 3. Delete for Everyone Flow

```
User Interface
    ↓
[Message Bubble] (< 60 seconds old)
    ↓
[Long Press] → [Menu Opens]
    ↓
[Check Time Remaining]
    ├─ If > 60s: Menu option hidden
    └─ If < 60s: Show "🗑 Delete for everyone"
    ↓
[Tap "🗑 Delete for everyone"]
    ↓
[Confirmation Dialog]
    ├─ Title: "Delete this message for everyone?"
    ├─ Subtitle: "You have 15s to delete for everyone."
    └─ Options: [Delete] [Cancel]
    ↓
[User Taps "Delete"]
    ↓
deleteDMForEveryone(chatId, messageId, createdAt)
    ├─ Validate: canEditOrDeleteForAll(createdAt)?
    └─ Send delete request to Firestore
    ↓
[Firebase Rules Check]
    ├─ Is sender == auth.uid? ✓
    ├─ Is request.time < createdAt + 60s? ✓
    └─ Is messageId valid? ✓
    ↓
[Delete Document]
    └─ Message document removed from Firestore
    ↓
[Listener Fires]
    └─ watchMessages() updates for both users
    ↓
[UI Updates - Your Device]
    ├─ Message removed from chat
    └─ Confirms deletion success
    ↓
[UI Updates - Friend's Device]
    └─ Message automatically disappears
        (listener detects deletion)
```

---

## 4. View Edit History Flow

```
User Interface
    ↓
[Edited Message] (shows "✏️ Edited" label)
    ↓
[Long Press] → [Menu Opens]
    ↓
[Tap "📝 Edit history"]
    ↓
viewEditHistory(message)
    ├─ Extract: message.editHistory[]
    └─ Set: editHistory state, showEditHistory = true
    ↓
[Modal Opens]
    ├─ Title: "Edit History"
    ├─ List all entries:
    │   ├─ Timestamp (oldest)
    │   ├─ Text from that version
    │   ├─ ---
    │   ├─ Timestamp (newer)
    │   ├─ Text from that version
    │   └─ ...
    └─ [Close] button
    ↓
[User Reads History]
    └─ See chronological edits
    ↓
[Tap "Close"]
    └─ Modal disappears
```

---

## 5. Firestore Data Structure

### Before Edit

```firestore
{
  "id": "abc123",
  "from": "user1",
  "text": "Hello world",
  "createdAt": Timestamp(2024-01-15 10:30:45),
  "reactions": {
    "user2": "👍"
  }
}
```

### After One Edit

```firestore
{
  "id": "abc123",
  "from": "user1",
  "text": "Hello beautiful world",
  "createdAt": Timestamp(2024-01-15 10:30:45),
  "editedAt": Timestamp(2024-01-15 10:31:12),
  "editHistory": [
    {
      "text": "Hello world",
      "editedAt": Timestamp(2024-01-15 10:31:12)
    }
  ],
  "reactions": {
    "user2": "👍"
  }
}
```

### After Multiple Edits

```firestore
{
  "id": "abc123",
  "from": "user1",
  "text": "Hello beautiful amazing world",
  "createdAt": Timestamp(2024-01-15 10:30:45),
  "editedAt": Timestamp(2024-01-15 10:32:30),
  "editHistory": [
    {
      "text": "Hello world",
      "editedAt": Timestamp(2024-01-15 10:31:12)
    },
    {
      "text": "Hello beautiful world",
      "editedAt": Timestamp(2024-01-15 10:32:30)
    }
  ],
  "reactions": {
    "user2": "👍"
  }
}
```

### After Delete for Me

```firestore
{
  "id": "abc123",
  "from": "user1",
  "text": "Hello beautiful amazing world",
  "createdAt": Timestamp(2024-01-15 10:30:45),
  "editedAt": Timestamp(2024-01-15 10:32:30),
  "editHistory": [
    {
      "text": "Hello world",
      "editedAt": Timestamp(2024-01-15 10:31:12)
    },
    {
      "text": "Hello beautiful world",
      "editedAt": Timestamp(2024-01-15 10:32:30)
    }
  ],
  "reactions": {
    "user2": "👍"
  },
  "deletedFor": {
    "user2": true  // ← User2 deleted for themselves
  }
}
```

---

## 6. State Management

```typescript
// In ChatView component
const [messages, setMessages] = useState<DM[]>([]);
  └─ Array of all messages in chat
     (filtered by !deletedFor[me.uid])

const [editingId, setEditingId] = useState<string | null>(null);
  └─ ID of message being edited, or null

const [editText, setEditText] = useState("");
  └─ Current text in edit input field

const [editHistory, setEditHistory] = useState<EditEntry[]>([]);
  └─ Previous versions of a message

const [showEditHistory, setShowEditHistory] = useState(false);
  └─ Whether edit history modal is visible

const [menu, setMenu] = useState<DM | null>(null);
  └─ Which message's menu is open
```

---

## 7. Menu Options Logic

```
Is message from me (sender)?
    ├─ NO → [Reply] [Forward] [Emoji Reactions]
    └─ YES → Check what's available:
         ├─ Is call? → [React] only
         ├─ Is text? → [Reply] [Forward] [Edit*] [History*] [Delete All*] [Delete Me]
         │   └─ *Only if < 60 seconds
         └─ Other type → [Reply] [Forward] [Delete All*] [Delete Me]
             └─ *Only if < 60 seconds
```

---

## 8. Time-Based Menu Options

```
Message created
    ↓
[0-60 seconds]
    ├─ Show: "✏️ Edit"
    ├─ Show: "🗑 Delete for everyone"
    └─ Show: "🗑 Delete for me"
    ↓
[After 60 seconds]
    ├─ Hide: "✏️ Edit"
    ├─ Hide: "🗑 Delete for everyone"
    └─ Show: "🗑 Delete for me" (always available)
```

---

## 9. Security Layers

```
User Action
    ↓
[Client-Side Check]
    ├─ canEditOrDeleteForAll(createdAt)?
    │   └─ Math.max(0, 60000 - age) > 0
    ├─ Is message from me?
    │   └─ m.from === me.uid
    └─ Is operation allowed?
        └─ Show/hide UI accordingly
    ↓
[User Confirms]
    └─ Sends request to Firestore
    ↓
[Firestore Rules Check]
    ├─ Authentication check
    │   └─ request.auth != null
    ├─ Authorization check
    │   └─ resource.data.from == request.auth.uid
    ├─ Timestamp check
    │   └─ request.time < createdAt + 60s
    └─ Field validation
        └─ Only allowed fields being modified
    ↓
[Operation Result]
    ├─ ✓ Allowed → Update/Delete document
    └─ ✗ Denied → Firestore error (caught by app)
```

---

## 10. Component Hierarchy

```
MessagesView
    ├─ Inbox
    │   └─ Chat list with long-press delete
    └─ Modal (one per chat)
        └─ ChatView
            ├─ Chat header
            ├─ Messages ScrollView
            │   └─ messages.filter().map()
            │       └─ SwipeRow
            │           ├─ HoverMenu
            │           │   └─ Message Bubble
            │           │       ├─ Edit Mode (if editingId === m.id)
            │           │       │   ├─ TextInput
            │           │       │   ├─ ✕ Button
            │           │       │   └─ ✓ Button
            │           │       └─ Display Mode
            │           │           ├─ "✏️ Edited" label
            │           │           ├─ Message content
            │           │           └─ Time + read receipt
            │           └─ ReactionChips
            ├─ Menu Modal
            │   └─ Menu options based on rules
            ├─ Edit History Modal
            │   └─ List of edit entries
            ├─ ReplyBar (if replying)
            └─ Composer
                ├─ Attachments
                ├─ TextInput
                └─ Send button
```

---

## 11. Firestore Collection Structure

```
firestore
├─ chats/
│   ├─ user1_user2/              (Sorted UIDs)
│   │   ├─ members: [user1, user2]
│   │   ├─ names: { user1: "Name1", user2: "Name2" }
│   │   ├─ lastText: "Last message preview"
│   │   ├─ lastAt: Timestamp
│   │   ├─ lastFrom: "user1"
│   │   ├─ seen: { user1: Timestamp, user2: Timestamp }
│   │   ├─ typing: { user1: 0, user2: Timestamp }
│   │   │
│   │   └─ messages/
│   │       ├─ msg1/
│   │       │   ├─ from: "user1"
│   │       │   ├─ text: "Message text"
│   │       │   ├─ createdAt: Timestamp
│   │       │   ├─ editedAt: Timestamp (optional)
│   │       │   ├─ editHistory: EditEntry[] (optional)
│   │       │   ├─ deletedFor: { user2: true } (optional)
│   │       │   ├─ reactions: { user1: "👍" } (optional)
│   │       │   ├─ reply: ReplyTo (optional)
│   │       │   ├─ media: Media[] (optional)
│   │       │   ├─ audio: Voice (optional)
│   │       │   ├─ doc: Doc (optional)
│   │       │   ├─ share: Share (optional)
│   │       │   ├─ call: CallLog (optional)
│   │       │   └─ fwd: boolean (optional)
│   │       │
│   │       ├─ msg2/
│   │       │   └─ (similar structure)
│   │       │
│   │       └─ msg3/
│   │           └─ (similar structure)
│   │
│   └─ user2_user3/
│       └─ (another chat)
│
├─ users/
│   └─ (user profiles, etc.)
│
└─ (other collections)
```

---

## 12. TypeScript Type Definitions

```typescript
// Message with edit/delete support
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
  
  // NEW: Edit support
  editedAt?: any;                      // When last edited
  editHistory?: EditEntry[];           // Previous versions
  
  // NEW: Delete for me support
  deletedFor?: Record<string, boolean>; // {userId: true}
};

// Single edit history entry
export type EditEntry = {
  text: string;
  editedAt: any;
};
```

---

## 13. Function Call Sequence

### Editing a Message
```
1. User long-presses message
2. setMenu(m) called
3. User taps "Edit"
4. setEditingId(m.id)
5. setEditText(m.text)
6. UI shows edit input
7. User types new text
8. User taps ✓
9. edit(m, editText) called
10. editDM(chatId, m.id, editText, m) called
11. Firebase updates message
12. Listener fires (watchMessages)
13. UI updates (message changed)
14. setEditingId(null)
15. setEditText("")
```

### Deleting for Everyone
```
1. User long-presses message (< 60s)
2. setMenu(m) called
3. User taps "Delete for everyone"
4. confirmAsk dialog shows
5. User confirms
6. deleteDMForEveryone(chatId, m.id, m.createdAt)
7. Firebase checks rules
   - Is sender? ✓
   - Is within 60s? ✓
   - Delete approved ✓
8. Message document deleted
9. Listener fires (watchMessages)
10. messages array updated (message removed)
11. UI updates (message gone)
```

---

## 14. Error Handling

```
Try to Edit
    ↓
Error Scenarios:
    ├─ Message > 60s old
    │   └─ "Messages can only be edited within 1 minute"
    ├─ Not message sender
    │   └─ Edit button won't show (UI prevents)
    ├─ Network error
    │   └─ setError("Couldn't edit the message.")
    ├─ Firestore rules reject
    │   └─ "permission-denied" → setError
    └─ Text is same as original
        └─ Cancel edit, don't send

Try to Delete for Everyone
    ↓
Error Scenarios:
    ├─ Message > 60s old
    │   └─ Menu option hidden, or error if somehow sent
    ├─ Not message sender
    │   └─ Delete option won't show
    ├─ Firestore rules reject
    │   └─ "permission-denied" → setError
    └─ Network error
        └─ setError("Couldn't delete.")
```

