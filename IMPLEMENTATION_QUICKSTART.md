# Message Edit & Delete Features - Quick Start Guide

## 📋 What's Being Added

Your GrateApex messaging app will now support:

1. **Edit Messages** (within 60 seconds)
   - Edit button appears in message menu
   - Shows "✏️ Edited" label
   - View full edit history

2. **Delete for Me** (anytime)
   - Message disappears from your chat
   - Still visible to the other person
   - Reversible (just refresh/reload)

3. **Delete for Everyone** (within 60 seconds)
   - Message removed from all conversations
   - Only available during the 1-minute window
   - Cannot be undone

---

## 🚀 Implementation Steps

### Step 1: Update messages.ts (5 minutes)
**File**: `src/messages.ts`

✅ **What's Done**: The file has already been updated with:
- `EditEntry` type definition
- Updated `DM` type with `editedAt`, `editHistory`, and `deletedFor` fields
- Helper functions:
  - `canEditOrDeleteForAll()` - Check if 1 minute hasn't passed
  - `editDM()` - Edit a message and store history
  - `deleteDMForMe()` - Delete for current user only
  - `deleteDMForEveryone()` - Delete for all users
  - `timeUntilEditLocked()` - Show time remaining

**Status**: ✅ COMPLETE

---

### Step 2: Update Messages.tsx (15 minutes)
**File**: `src/screens/Messages.tsx`

**Steps to follow** (in order):

#### 2.1 Update Imports (Line 23)
```typescript
// Find this line:
import { Chat, DM, ReplyTo, talked, chatId, deleteDM, deleteChat, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages } from "../messages";

// Replace with:
import { Chat, DM, ReplyTo, talked, chatId, deleteDM, deleteChat, reactDM, setTyping, fetchFriends, isUnread, markSeen, ms, otherOf, sendDM, snippet, watchChat, watchChats, watchMessages, editDM, deleteDMForMe, deleteDMForEveryone, canEditOrDeleteForAll, timeUntilEditLocked, EditEntry } from "../messages";
```

#### 2.2 Add State Variables (After Line 134)
```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [editText, setEditText] = useState("");
const [editHistory, setEditHistory] = useState<EditEntry[]>([]);
const [showEditHistory, setShowEditHistory] = useState(false);
```

#### 2.3 Add Handler Functions (Before Line 203)
Copy-paste the four functions from `MESSAGES_TSX_CHANGES.md` → Change 3

#### 2.4 Filter Deleted Messages (Line 215)
Change:
```typescript
{messages.map((m) => {
```
To:
```typescript
{messages
  .filter(m => !m.deletedFor?.[me.uid])
  .map((m) => {
```

#### 2.5 Update Message Menu (Lines 302-312)
Replace entire menu section with code from `MESSAGES_TSX_CHANGES.md` → Change 5

#### 2.6 Update Message Rendering (Lines 235-260)
Replace message display with code from `MESSAGES_TSX_CHANGES.md` → Change 6
(This includes edit mode UI and "edited" label)

#### 2.7 Add Edit History Modal (After Line 316)
Add modal code from `MESSAGES_TSX_CHANGES.md` → Change 7

#### 2.8 Add Styles (In makeStyles function)
Add at the end of the style object:
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

**Status**: ⏳ MANUAL WORK REQUIRED

---

### Step 3: Update Firestore Rules (5 minutes)
**File**: `firestore.rules`

Find the `match /messages/{messageId}` section and replace with rules from `FIRESTORE_RULES_PATCH.md`

**Deploy**:
```bash
firebase deploy --only firestore:rules
```

**Status**: ⏳ MANUAL WORK REQUIRED

---

## 📱 User Experience Flow

### Editing a Message
1. User long-presses message → Menu appears
2. Taps "✏️ Edit" → Message enters edit mode
3. Message bubble shows text input with ✕ and ✓ buttons
4. User edits text and taps ✓ to save
5. Message updates with "✏️ Edited" label
6. Other user sees updated text immediately

### Viewing Edit History
1. User taps "📝 Edit history" from menu
2. Modal shows all previous versions with timestamps
3. User can see evolution of the message
4. Taps "Close" to dismiss

### Deleting for Yourself
1. User long-presses message → Menu appears
2. Taps "🗑 Delete for me"
3. Confirmation dialog explains message stays visible to friend
4. User confirms → Message disappears from their view only
5. Friend still sees the message

### Deleting for Everyone
1. User long-presses message (within 60 seconds) → Menu appears
2. Taps "🗑 Delete for everyone"
3. Confirmation dialog shows time remaining
4. User confirms → Message removed for all users
5. Message cannot be recovered

---

## 🔒 Security Implementation

### Time-Based Locking
- **Client-side**: `canEditOrDeleteForAll()` function checks timestamp
- **Server-side**: Firestore rules enforce 60-second window
- **Fallback**: If client check fails, server will reject operation

### Data Structure
```typescript
DM = {
  id: string;
  from: string;
  text: string;
  createdAt: Timestamp;
  editedAt?: Timestamp;              // Set when edited
  editHistory?: EditEntry[];          // Previous versions
  deletedFor?: Record<string, boolean>; // Who deleted for themselves
}
```

### Firestore Rules
```firestore
// Only message owner can edit/delete
allow update: if resource.data.from == request.auth.uid

// Only within 60 seconds
allow update: if request.time < timestamp(createdAt + 60s)

// deletedFor is special (no time limit, user-only)
allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['deletedFor'])
```

---

## 📊 File Checklist

### Modified Files
- [x] `src/messages.ts` - ✅ DONE
- [ ] `src/screens/Messages.tsx` - ⏳ TO DO
- [ ] `firestore.rules` - ⏳ TO DO

### Documentation Files (Created)
- `MESSAGE_FEATURES_IMPLEMENTATION.md` - Detailed guide
- `MESSAGES_TSX_CHANGES.md` - Exact code changes
- `FIRESTORE_RULES_PATCH.md` - Rules update
- `IMPLEMENTATION_QUICKSTART.md` - This file

---

## 🧪 Testing Checklist

After implementation, test these scenarios:

### Editing
- [ ] Can edit message within 60 seconds
- [ ] Cannot edit after 60 seconds
- [ ] "✏️ Edited" label appears
- [ ] Edit history shows previous version
- [ ] Cannot edit other user's messages
- [ ] Cannot edit calls/media/audio messages

### Deleting for Me
- [ ] Message disappears from my chat
- [ ] Message still visible to friend
- [ ] Can still see my deletion (browser refresh)
- [ ] Works on multiple devices

### Deleting for Everyone
- [ ] Can delete within 60 seconds
- [ ] Cannot delete after 60 seconds
- [ ] Message removed immediately
- [ ] Message gone for all participants
- [ ] Cannot delete other user's messages

### Edge Cases
- [ ] Edit a message, then another user sees update
- [ ] Delete a message, then check other user's view
- [ ] Edit history shows multiple edits
- [ ] Edit history timestamps are correct
- [ ] Time countdown works correctly
- [ ] Menu options disappear after time limit

### Cross-Platform
- [ ] Web: All features work
- [ ] iOS: Edit UI works with keyboard
- [ ] Android: Edit UI works with keyboard
- [ ] Edit history modal responsive
- [ ] Delete modals work on all platforms

---

## 🐛 Troubleshooting

### "Cannot edit message after 1 minute"
- ✅ Expected behavior - only editable within 60 seconds

### Menu options not showing
- Check that message is less than 60 seconds old
- Verify `canEditOrDeleteForAll()` function imported correctly
- Clear browser cache and reload

### "Edit" button missing for owned messages
- Ensure imports include `editDM` and `canEditOrDeleteForAll`
- Check that `canEdit()` function is defined
- Verify message creation timestamp is correct

### Deleted messages still showing
- Ensure `.filter(m => !m.deletedFor?.[me.uid])` applied
- Check that `me.uid` is correctly set
- Verify Firestore data has `deletedFor` field populated

### Edit history not showing
- Ensure message has `editHistory` field in Firestore
- Check that `viewEditHistory()` function is called
- Verify edit history array has entries

### Firestore rules errors
- Deploy rules: `firebase deploy --only firestore:rules`
- Check browser console for specific error messages
- See `FIRESTORE_RULES_PATCH.md` for rule syntax help

---

## 📚 Reference Files

All implementation details are in:

1. **`MESSAGE_FEATURES_IMPLEMENTATION.md`**
   - Full feature specifications
   - Type definitions
   - All function signatures
   - Firestore rules guide

2. **`MESSAGES_TSX_CHANGES.md`**
   - Line-by-line code changes
   - Before/after comparisons
   - Ready to copy-paste
   - Detailed testing checklist

3. **`FIRESTORE_RULES_PATCH.md`**
   - Security rules
   - Testing queries
   - Troubleshooting guide
   - Backup/restore instructions

---

## ⏱️ Time Estimates

- [ ] Update messages.ts: 5 min (already done)
- [ ] Update Messages.tsx: 15 min (8 small changes)
- [ ] Update Firestore rules: 5 min
- [ ] Testing: 20 min
- **Total: ~45 minutes**

---

## ✅ Completion Checklist

- [ ] Read this entire guide
- [ ] Open `MESSAGES_TSX_CHANGES.md`
- [ ] Apply Change 1 (imports)
- [ ] Apply Change 2 (state variables)
- [ ] Apply Change 3 (handler functions)
- [ ] Apply Change 4 (message filtering)
- [ ] Apply Change 5 (menu updates)
- [ ] Apply Change 6 (message rendering)
- [ ] Apply Change 7 (edit history modal)
- [ ] Apply Change 8 (styles)
- [ ] Update `firestore.rules` from `FIRESTORE_RULES_PATCH.md`
- [ ] Deploy rules: `firebase deploy --only firestore:rules`
- [ ] Test all 10+ scenarios from testing checklist
- [ ] Deploy to production

---

## 🎉 After Completion

Once all steps are done:

1. Users can edit messages within 1 minute
2. Full edit history is preserved
3. Users can delete for themselves anytime
4. Users can delete for everyone within 1 minute
5. Security is enforced both client and server-side
6. No message data is lost (edit history stored)
7. UI clearly indicates edited messages

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed guides for your specific issue
3. Check browser console for Firestore permission errors
4. Verify you deployed Firestore rules with `firebase deploy`
5. Look at `messages.ts` backup if you need to revert

Good luck with the implementation! 🚀
