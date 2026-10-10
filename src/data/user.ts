import { useAuth } from '@/auth';

// The signed-in student's name and photo, straight from the hub profile (users/{uid}).
export function useDisplayName(): string | null {
  const { profile } = useAuth() as any;
  return profile?.displayName?.trim() || profile?.username || null;
}
// The unique @username, when you need the handle rather than the friendly name.
export function useUsername(): string | null {
  const { profile } = useAuth() as any;
  return profile?.username ?? null;
}
export function useAvatarUrl(): string | null {
  const { profile } = useAuth() as any;
  return profile?.photo ?? null;
}
