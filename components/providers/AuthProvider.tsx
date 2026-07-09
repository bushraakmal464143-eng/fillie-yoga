"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AuthModal from "@/components/AuthModal";
import type { User } from "@/lib/types";

type AuthMode = "login" | "signup";

type AuthContextValue = {
  user: User | null;
  authReady: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  authMessage: string | null;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<string | null>;
  sendSignupCode: (name: string, email: string, password: string) => Promise<string | null>;
  verifySignupCode: (
    name: string,
    email: string,
    password: string,
    code: string,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;
        const data = (await response.json()) as { user: User | null };
        setUser(data.user);
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  const openAuth = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setAuthMessage(null);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setAuthMessage(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as { user?: User; error?: string };
    if (!response.ok) return data.error ?? "Could not log in.";

    let loggedInUser = data.user ?? null;
    if (!loggedInUser) {
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = (await sessionRes.json()) as { user: User | null };
        loggedInUser = sessionData.user;
      }
    }

    if (!loggedInUser) return "Could not log in. Please try again.";

    setUser(loggedInUser);
    setAuthMessage(null);
    setAuthOpen(false);
    return null;
  }, []);

  const sendSignupCode = useCallback(async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = (await response.json()) as { error?: string; needsVerification?: boolean };
    if (!response.ok) return data.error ?? "Could not send verification code.";

    setAuthMessage(`We sent a verification code to ${email.trim()}. Check your inbox.`);
    return null;
  }, []);

  const verifySignupCode = useCallback(
    async (name: string, email: string, password: string, code: string) => {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code }),
      });

      const data = (await response.json()) as { user?: User; error?: string };
      if (!response.ok) return data.error ?? "Could not verify code.";

      let loggedInUser = data.user ?? null;
      if (!loggedInUser) {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = (await sessionRes.json()) as { user: User | null };
          loggedInUser = sessionData.user;
        }
      }

      if (!loggedInUser) return "Code verified but login failed. Please try logging in.";

      setUser(loggedInUser);
      setAuthMessage(null);
      setAuthOpen(false);
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      authOpen,
      authMode,
      authMessage,
      openAuth,
      closeAuth,
      login,
      sendSignupCode,
      verifySignupCode,
      logout,
    }),
    [
      user,
      authReady,
      authOpen,
      authMode,
      authMessage,
      openAuth,
      closeAuth,
      login,
      sendSignupCode,
      verifySignupCode,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
