import { useMemo } from "react";
import { useAuth as useHubAuth } from "@/auth";

// Master's components read `session.user`; this adapts this hub's auth to that shape.
export interface AuthUser {
  id: string; uid: string; email: string | null; displayName: string | null;
  created_at?: string; user_metadata?: Record<string, any>; profile?: Record<string, any>;
}
export interface AuthSession { user: AuthUser }
export interface AuthState { session: AuthSession | null; user: AuthUser | null; loading: boolean }

export function useAuth(): AuthState {
  const { user, profile, loading } = useHubAuth() as any;
  return useMemo(() => {
    if (!user) return { session: null, user: null, loading: !!loading };
    const p = (profile ?? {}) as Record<string, any>;
    const u: AuthUser = {
      id: user.uid, uid: user.uid, email: user.email ?? null,
      displayName: p.username || user.displayName || null,
      user_metadata: { ...p, full_name: p.username || user.displayName || "", onboarding_completed: p.onboardingDone === true },
      profile: p,
    };
    return { session: { user: u }, user: u, loading: !!loading };
  }, [user, profile, loading]);
}
