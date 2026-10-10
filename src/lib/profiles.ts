import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  [key: string]: any;
};

export type ProfileUpdate = {
  display_name?: string | null;
  avatar_url?: string | null;
  [key: string]: any;
};

export type ProfileResponse = {
  data: Profile | null;
  error: Error | null;
};

/**
 * Fetches a profile by its authenticated user ID from Firestore users collection.
 */
export async function getProfileById(userId: string): Promise<ProfileResponse> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      return { data: null, error: null };
    }

    const d = snap.data();
    const profile: Profile = {
      id: userId,
      display_name: d.username || d.display_name || null,
      avatar_url: d.avatar_url || d.avatarUrl || null,
      created_at: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate().toISOString() : String(d.createdAt)) : new Date().toISOString(),
      ...d,
    };

    return { data: profile, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Fetches the currently authenticated user's profile.
 * Returns { data: null, error: null } if no session exists.
 */
export async function getCurrentProfile(): Promise<ProfileResponse> {
  const current = auth.currentUser;
  if (!current) {
    return { data: null, error: null };
  }
  return await getProfileById(current.uid);
}

/**
 * Updates a profile for a specific user ID in Firestore.
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<ProfileResponse> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const firestoreUpdates: Record<string, any> = { ...updates };
    if (updates.display_name !== undefined) {
      firestoreUpdates.username = updates.display_name;
    }

    await setDoc(userDocRef, firestoreUpdates, { merge: true });

    return await getProfileById(userId);
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Updates the currently authenticated user's profile (display name, avatar).
 */
export async function updateCurrentProfile(
  updates: ProfileUpdate
): Promise<ProfileResponse> {
  const current = auth.currentUser;
  if (!current) {
    return {
      data: null,
      error: new Error('Cannot update profile: no authenticated user found.'),
    };
  }
  return await updateProfile(current.uid, updates);
}

export async function setAvatarUrl(url: string | null): Promise<ProfileResponse> {
  return await updateCurrentProfile({ avatar_url: url });
}
