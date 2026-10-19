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

export type AuthMode = "login" | "signup" | "forgot";

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
  sendPasswordResetCode: (email: string) => Promise<string | null>;
  resetPassword: (email: string, code: string, password: string) => Promise<string | null>;
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1" || params.get("admin") === "1") {
      setAuthMode("login");
      setAuthOpen(true);
      setAuthMessage(
        params.get("admin") === "1"
          ? "Sign in with your admin email and password to open the studio desk."
          : null,
      );
      params.delete("login");
      params.delete("admin");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }
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

    const data = (await response.json()) as {
      user?: User;
      error?: string;
      isAdmin?: boolean;
    };
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

    if (data.isAdmin) {
      // Full navigation so the admin cookie is applied before /admin loads.
      window.location.href = "/admin";
      return null;
    }

    return null;
  }, []);

  const sendSignupCode = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        needsVerification?: boolean;
        user?: User;
      };
      if (!response.ok) return data.error ?? "Could not send verification code.";

      if (data.user && !data.needsVerification) {
        setUser(data.user);
        setAuthMessage(null);
        setAuthOpen(false);
        return null;
      }

      setAuthMessage(`We sent a verification code to ${email.trim()}. Check your inbox.`);
      return null;
    } catch {
      return "Network error. Please try again.";
    }
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

  const sendPasswordResetCode = useCallback(async (email: string) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) return data.error ?? "Could not send reset code.";

      setAuthMessage(
        data.message ??
          `If an account exists for ${email.trim()}, we sent a reset code. Check your inbox.`,
      );
      return null;
    } catch {
      return "Network error. Please try again.";
    }
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, password: string) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = (await response.json()) as {
        user?: User;
        error?: string;
        needsLogin?: boolean;
        message?: string;
      };

      if (!response.ok) return data.error ?? "Could not reset password.";

      if (data.needsLogin) {
        setAuthMode("login");
        setAuthMessage(data.message ?? "Password updated. Please log in with your new password.");
        return null;
      }

      let loggedInUser = data.user ?? null;
      if (!loggedInUser) {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = (await sessionRes.json()) as { user: User | null };
          loggedInUser = sessionData.user;
        }
      }

      if (!loggedInUser) {
        setAuthMode("login");
        setAuthMessage("Password updated. Please log in with your new password.");
        return null;
      }

      setUser(loggedInUser);
      setAuthMessage(null);
      setAuthOpen(false);
      return null;
    } catch {
      return "Network error. Please try again.";
    }
  }, []);

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
      sendPasswordResetCode,
      resetPassword,
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
      sendPasswordResetCode,
      resetPassword,
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
