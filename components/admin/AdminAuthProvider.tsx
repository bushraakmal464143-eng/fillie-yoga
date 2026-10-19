"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLoadingSkeleton } from "@/components/Skeleton";
import { ROUTES } from "@/lib/routes";

type AdminAuthContextValue = {
  authenticated: boolean | null;
  busy: boolean;
  error: string;
  success: string;
  showSuccess: (message: string) => void;
  setError: (message: string) => void;
  setBusy: (busy: boolean) => void;
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
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
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

  const logout = useCallback(async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    await fetch("/api/auth/logout", { method: "POST" });
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
    router.push(`${ROUTES.home}?login=1`);
  }, [router]);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
    void refreshCounts();
  }, [refreshCounts]);

  const value = useMemo(
    () => ({
      authenticated,
      busy,
      error,
      success,
      showSuccess,
      setError,
      setBusy,
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
          <AdminLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login-wrap">
          <div className="admin-login">
            <p className="admin-eyebrow">Om At Home</p>
            <h1>Studio desk</h1>
            <p>
              There is no separate admin login. Sign in on the main site with your admin email and
              password, then open this page.
            </p>
            <Link className="admin-btn admin-btn--block" href={`${ROUTES.home}?login=1`}>
              Log in on the main site
            </Link>
            <p className="admin-hint">
              After you log in as admin, you&apos;ll be taken to the studio desk automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
