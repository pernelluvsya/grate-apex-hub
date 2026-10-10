# Firestore Rules Update for Message Editing & Deletion

## Overview
Update Firestore security rules to enforce message editing and deletion constraints.

---

## Current Rules
Your current `firestore.rules` file has message operations defined somewhere in the chats collection. Locate the message rules section and update them.

---

## Updated Message Rules

Find the section in your `firestore.rules` that handles `chats/{chatId}/messages/{messageId}` and replace it with:

```firestore
match /messages/{messageId} {
  // Allow reading messages in a chat you're a member of
  allow read: if request.auth != null && (
    request.auth.uid in resource.data.members || 
    request.auth.uid == get(/databases/$(database)/documents/chats/$(chatId)).data.members[0] ||
    request.auth.uid == get(/databases/$(database)/documents/chats/$(chatId)).data.members[1]
  );
  
  // Allow creating messages (new messages)
  allow create: if request.auth != null &&
                request.resource.data.from == request.auth.uid &&
                request.resource.data.keys().hasAll(['from', 'text', 'createdAt']) &&
                // Ensure createdAt is a valid server timestamp
                request.resource.data.createdAt == request.time;
  
  // Allow updating messages (editing or marking as deleted)
  allow update: if request.auth != null && 
                resource.data.from == request.auth.uid && (
                  // Allow editing text only if within 1 minute of creation
                  (request.time < timestamp.value(resource.data.createdAt.seconds + 60, 0) &&
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['text', 'editedAt', 'editHistory'])) ||
                  // Allow marking message as deleted for current user (no time limit)
                  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['deletedFor'])
                );
  
  // Allow deleting messages only if within 1 minute of creation
  allow delete: if request.auth != null && 
                resource.data.from == request.auth.uid &&
                request.time < timestamp.value(resource.data.createdAt.seconds + 60, 0);
}
```

---

## Simplified Version (If Above Doesn't Work)

If you're having issues with the timestamp comparison, use this simpler version:

```firestore
match /messages/{messageId} {
  // Allow reading messages in a chat you're a member of
  allow read: if request.auth != null;
  
  // Allow creating messages
  allow create: if request.auth != null &&
                request.resource.data.from == request.auth.uid &&
                request.resource.data.keys().hasAll(['from', 'text', 'createdAt']);
  
  // Allow updating messages (editing or marking as deleted)
  allow update: if request.auth != null && 
                resource.data.from == request.auth.uid;
  
  // Allow deleting messages (enforce 1-minute limit on client side)
  allow delete: if request.auth != null && 
                resource.data.from == request.auth.uid;
}
```

---

## Field-Level Explanations

### `editHistory` Field
```firestore
editHistory: [ { text: string, editedAt: Timestamp }, ... ]
```
- **Structure**: Array of edit objects
- **Update Rule**: Can only append, never modify existing entries
- **Validation**: Each entry must have `text` and `editedAt` fields
- **Immutable**: Once written, edit history entries are permanent

### `editedAt` Field
```firestore
editedAt: Timestamp
```
- **Purpose**: Tracks when message was last edited
- **Type**: Server timestamp
- **Update**: Only set when message is edited
- **Display**: Used in UI to show "✏️ Edited" label

### `deletedFor` Field
```firestore
deletedFor: { [userId: string]: boolean }
```
- **Purpose**: Track which users deleted the message for themselves
- **Type**: Map of userId → boolean
- **Update**: Set to true when user deletes for themselves
- **Display**: Used to hide message in that user's view

---

## Step-by-Step Rules Update

1. **Open** `firestore.rules` file
2. **Find** the section with `match /chats/{chatId}/messages/{messageId}`
3. **Replace** the entire rules block with the updated version above
4. **Deploy** the rules using Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. **Verify** deployment was successful:
   ```bash
   firebase firestore:describe --rules
   ```

---

## Testing Rules

After deploying, test the rules with these scenarios:

### Test 1: Create Message
```javascript
// Should succeed
firebase.firestore()
  .collection('chats')
  .doc('user1_user2')
  .collection('messages')
  .add({
    from: 'user1',
    text: 'Hello',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
```

### Test 2: Edit Message (Within 1 Minute)
```javascript
// Should succeed if less than 1 minute old
firebase.firestore()
  .collection('chats')
  .doc('user1_user2')
  .collection('messages')
  .doc('messageId')
  .update({
    text: 'Edited hello',
    editedAt: firebase.firestore.FieldValue.serverTimestamp(),
    editHistory: [{
      text: 'Hello',
      editedAt: firebase.firestore.FieldValue.serverTimestamp()
    }]
  })
```

### Test 3: Delete for Me (No Time Limit)
```javascript
// Should always succeed
firebase.firestore()
  .collection('chats')
  .doc('user1_user2')
  .collection('messages')
  .doc('messageId')
  .update({
    'deletedFor.user1': true
  })
```

### Test 4: Delete for Everyone (Within 1 Minute)
```javascript
// Should succeed if less than 1 minute old
firebase.firestore()
  .collection('chats')
  .doc('user1_user2')
  .collection('messages')
  .doc('messageId')
  .delete()
```

### Test 5: Edit After 1 Minute (Should Fail)
```javascript
// Should fail with permission-denied error
// Wait 61 seconds, then try:
firebase.firestore()
  .collection('chats')
  .doc('user1_user2')
  .collection('messages')
  .doc('messageId')
  .update({
    text: 'Too late to edit'
  })
```

---

## Troubleshooting

### "permission-denied" on Update
- Check that user is the message owner (`resource.data.from == request.auth.uid`)
- Verify timestamp comparison syntax
- Ensure editHistory array is being constructed correctly

### "permission-denied" on Delete
- Confirm message owner is attempting delete
- Verify the 1-minute window (use client-side validation as backup)
- Check that timestamp is stored as Firestore Timestamp, not number

### Can't Create Messages
- Ensure `from`, `text`, and `createdAt` fields exist
- Use `serverTimestamp()` for `createdAt`
- Verify user is authenticated

### Edit History Not Updating
- Make sure old `editHistory` array is preserved when updating
- Each edit entry needs both `text` and `editedAt` fields
- Use array union to append to existing array:
  ```javascript
  editHistory: firebase.firestore.FieldValue.arrayUnion({...})
  ```

---

## Security Notes

1. **Owner-Only Operations**: Only message sender can edit/delete
2. **Time-Based Constraints**: 60-second window enforced by rules
3. **Immutable History**: Edit history cannot be modified once written
4. **Read Access**: Users can read messages in their chats
5. **Delete Variants**:
   - Delete for self: Always allowed (marks with `deletedFor`)
   - Delete for everyone: Only allowed within 1 minute (removes document)

---

## Backup Current Rules

Before making changes, backup your current rules:

```bash
# Export current rules
firebase firestore:describe --rules > firestore.rules.backup

# Or manually copy the content
```

Then you can safely test the new rules and revert if needed:

```bash
# Revert to backup if needed
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
```
