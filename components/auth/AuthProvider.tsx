"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "../../lib/supabase/client";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!session?.access_token) {
        setIsAdmin(false);
        return;
      }
      try {
        const response = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const data = (await response.json()) as { is_admin?: boolean };
        setIsAdmin(Boolean(data.is_admin));
      } catch {
        setIsAdmin(false);
      }
    };
    loadAdmin();
  }, [session?.access_token]);

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  return useContext(AuthContext).user;
}

export function useSession() {
  return useContext(AuthContext);
}
