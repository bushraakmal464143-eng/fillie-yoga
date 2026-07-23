"use client";

import {
  FormEvent,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AdminAuthContextValue = {
  authenticated: boolean | null;
  busy: boolean;
  error: string;
  success: string;
  showSuccess: (message: string) => void;
  setError: (message: string) => void;
  setBusy: (busy: boolean) => void;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => void;
  refreshKey: number;
  refreshCounts: () => Promise<void>;
  counts: {
    offers: number;
    sessions: number;
    pricing: number;
    members: number;
    logins: number;
    subscriptions: number;
    bookings: number;
  };
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return value;
}

export default function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [counts, setCounts] = useState({
    offers: 0,
    sessions: 0,
    pricing: 0,
    members: 0,
    logins: 0,
    subscriptions: 0,
    bookings: 0,
  });

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setError("");
    window.setTimeout(() => setSuccess(""), 3000);
  }, []);

  const refreshCounts = useCallback(async () => {
    const [offersRes, sessionsRes, pricingRes, membersRes] = await Promise.all([
      fetch("/api/admin/offers"),
      fetch("/api/admin/sessions"),
      fetch("/api/admin/pricing"),
      fetch("/api/admin/members"),
    ]);

    if (
      offersRes.status === 401 ||
      sessionsRes.status === 401 ||
      pricingRes.status === 401 ||
      membersRes.status === 401
    ) {
      setAuthenticated(false);
      return;
    }

    const [offers, sessions, pricing] = await Promise.all([
      offersRes.json(),
      sessionsRes.json(),
      pricingRes.json(),
    ]);

    let members = 0;
    let logins = 0;
    let subscriptions = 0;
    let bookings = 0;

    if (membersRes.ok) {
      const membersData = (await membersRes.json()) as {
        members?: unknown[];
        logins?: unknown[];
        subscriptions?: unknown[];
        bookings?: unknown[];
      };
      members = membersData.members?.length ?? 0;
      logins = membersData.logins?.length ?? 0;
      subscriptions = membersData.subscriptions?.length ?? 0;
      bookings = membersData.bookings?.length ?? 0;
    }

    setCounts({
      offers: Array.isArray(offers) ? offers.length : 0,
      sessions: Array.isArray(sessions) ? sessions.length : 0,
      pricing: Array.isArray(pricing) ? pricing.length : 0,
      members,
      logins,
      subscriptions,
      bookings,
    });
  }, []);

  useEffect(() => {
    void (async () => {
      const authRes = await fetch("/api/admin/auth");
      const authData = (await authRes.json()) as { authenticated: boolean };
      if (!authData.authenticated) {
        setAuthenticated(false);
        return;
      }
      setAuthenticated(true);
      await refreshCounts();
    })();
  }, [refreshCounts]);

  const login = useCallback(
    async (nextPassword: string) => {
      setError("");
      setBusy(true);

      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPassword }),
      });

      setBusy(false);
      if (!response.ok) {
        setError("Incorrect password.");
        return false;
      }

      setPassword("");
      setAuthenticated(true);
      await refreshCounts();
      setRefreshKey((key) => key + 1);
      return true;
    },
    [refreshCounts],
  );

  const logout = useCallback(async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setCounts({
      offers: 0,
      sessions: 0,
      pricing: 0,
      members: 0,
      logins: 0,
      subscriptions: 0,
      bookings: 0,
    });
    setError("");
    setSuccess("");
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
    void refreshCounts();
  }, [refreshCounts]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    await login(password);
  };

  const value = useMemo(
    () => ({
      authenticated,
      busy,
      error,
      success,
      showSuccess,
      setError,
      setBusy,
      login,
      logout,
      refresh,
      refreshKey,
      refreshCounts,
      counts,
    }),
    [
      authenticated,
      busy,
      error,
      success,
      showSuccess,
      login,
      logout,
      refresh,
      refreshKey,
      refreshCounts,
      counts,
    ],
  );

  if (authenticated === null) {
    return (
      <div className="admin-page">
        <div className="admin-shell admin-shell--center">
          <div className="admin-loading" role="status">
            <span className="admin-loading-mark" aria-hidden="true">
              ॐ
            </span>
            <p>Opening studio desk…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login-wrap">
          <form className="admin-login" onSubmit={handleLogin}>
            <p className="admin-eyebrow">Om At Home</p>
            <h1>Studio desk</h1>
            <p>Sign in to manage class cards, schedule sessions, and membership pricing.</p>
            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <p className="admin-error">{error}</p>}
            <button className="admin-btn admin-btn--block" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <p className="admin-hint">
              Default password is <strong>omathome</strong>. Change it with the{" "}
              <code>ADMIN_PASSWORD</code> environment variable.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
