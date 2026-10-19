"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { isFirebaseConfigured } from "./firebase";
import { getUserSettings, onAuthChange } from "./firebase-actions";
import type { AppUser, UserSettings } from "./types";

interface AuthState {
  user: AppUser | null;
  /** The signed-in user's AI provider settings, or null when none are saved. */
  settings: UserSettings | null;
  loading: boolean;
  setSettings: (settings: UserSettings | null) => void;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  // Without Firebase config nobody can be signed in, so there is nothing to wait for.
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthChange(async (next) => {
      setUser(next);
      setSettings(next ? await getUserSettings(next.uid).catch(() => null) : null);
      setLoading(false);
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    if (user) setSettings(await getUserSettings(user.uid));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, settings, loading, setSettings, refreshSettings }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
