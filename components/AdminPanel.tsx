"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";

type WebsiteUser = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  lastLoginAt?: number;
};

type LoginEvent = {
  id: string;
  userId: string;
  name: string;
  email: string;
  action: "login" | "signup" | "logout";
  at: number;
  ip: string;
  userAgent: string;
};

const HUB_LINKS = [
  {
    href: ROUTES.adminSubscribers,
    title: "Subscribers",
    desc: "Stripe subscriptions, payments, and customer details",
    mark: "◎",
    tone: "sunset",
  },
  {
    href: ROUTES.adminClasses,
    title: "Classes",
    desc: "Class cards and weekly schedule sessions",
    mark: "✧",
    tone: "vinyasa",
  },
  {
    href: ROUTES.adminPricing,
    title: "Pricing plans",
    desc: "Membership prices, features, and CTA text",
    mark: "◇",
    tone: "pilates",
  },
] as const;

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [websiteUsers, setWebsiteUsers] = useState<WebsiteUser[]>([]);
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);

  const closeMenu = () => setMenuOpen(false);

  const loadData = useCallback(async () => {
    const usersRes = await fetch("/api/admin/users");
    if (usersRes.status === 401) {
      setAuthenticated(false);
      return;
    }

    setAuthenticated(true);
    const usersData = (await usersRes.json()) as {
      users?: WebsiteUser[];
      logins?: LoginEvent[];
    };
    setWebsiteUsers(usersData.users ?? []);
    setLoginEvents(usersData.logins ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      const authRes = await fetch("/api/admin/auth");
      const authData = (await authRes.json()) as { authenticated: boolean };
      if (!authData.authenticated) {
        setAuthenticated(false);
        return;
      }
      await loadData();
    })();
  }, [loadData]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("Incorrect password.");
      return;
    }
    setPassword("");
    await loadData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setWebsiteUsers([]);
    setLoginEvents([]);
  };

  if (authenticated === null) {
    return (
      <div className="admin-page">
        <div className="admin-shell">
          <p className="admin-loading">Loading admin…</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-page admin-page--auth">
        <form className="admin-login" onSubmit={handleLogin}>
          <div className="admin-login-mark" aria-hidden>
            ॐ
          </div>
          <p className="admin-kicker">Om At Home</p>
          <h1>Admin access</h1>
          <p>Sign in to manage classes, pricing, and subscribers.</p>
          <div className="admin-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-top admin-top--bar">
          {menuOpen && (
            <button
              type="button"
              className="admin-menu-overlay"
              aria-label="Close menu"
              onClick={closeMenu}
            />
          )}
          <div className="admin-brand">
            <span className="admin-brand-mark" aria-hidden>
              ॐ
            </span>
            <div>
              <p className="admin-kicker">Om At Home</p>
              <h1>Admin dashboard</h1>
            </div>
          </div>
          <button
            className="admin-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-actions"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div id="admin-actions" className={`admin-actions${menuOpen ? " is-open" : ""}`}>
            <button
              className="admin-btn-secondary"
              type="button"
              onClick={() => {
                closeMenu();
                void loadData();
              }}
            >
              Refresh
            </button>
            <button
              className="admin-btn-secondary"
              type="button"
              onClick={() => {
                closeMenu();
                void handleLogout();
              }}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="admin-hero">
          <div>
            <h2>Welcome back</h2>
            <p>Pick a section to manage your studio site.</p>
          </div>
          <div className="admin-stat-row">
            <div className="admin-stat">
              <strong>{websiteUsers.length}</strong>
              <span>Accounts</span>
            </div>
            <div className="admin-stat">
              <strong>{loginEvents.length}</strong>
              <span>Recent events</span>
            </div>
          </div>
        </section>

        <div className="admin-hub-grid">
          {HUB_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-hub-card admin-hub-card--${item.tone}`}
            >
              <span className="admin-hub-mark" aria-hidden>
                {item.mark}
              </span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="admin-hub-cta">Open →</span>
            </Link>
          ))}
        </div>

        <section className="admin-card admin-card--panel">
          <div className="admin-panel-head">
            <div>
              <h2>Website logins</h2>
              <p>
                People who signed up or logged in on your site · {websiteUsers.length} accounts
              </p>
            </div>
          </div>

          <div className="admin-split">
            <div>
              <h3 className="admin-list-heading">Accounts</h3>
              {websiteUsers.length === 0 ? (
                <p className="admin-hint">No accounts yet.</p>
              ) : (
                <div className="admin-subscriber-list">
                  {websiteUsers.map((user) => (
                    <article key={user.id} className="admin-subscriber-card">
                      <div className="admin-subscriber-top">
                        <div>
                          <h3>{user.name}</h3>
                          <p className="admin-subscriber-meta">{user.email}</p>
                        </div>
                        <span className="admin-status admin-status--active">member</span>
                      </div>
                      <dl className="admin-subscriber-details">
                        <div>
                          <dt>Joined</dt>
                          <dd>{new Date(user.createdAt).toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt>Last login</dt>
                          <dd>
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleString()
                              : "No login recorded yet"}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="admin-list-heading">Recent activity</h3>
              {loginEvents.length === 0 ? (
                <p className="admin-hint">New signups and logins will appear here.</p>
              ) : (
                <div className="admin-activity-list">
                  {loginEvents.map((event) => (
                    <div key={event.id} className="admin-activity-item">
                      <div className="admin-activity-main">
                        <strong>{event.name}</strong>
                        <span className={`admin-status admin-status--${event.action}`}>
                          {event.action}
                        </span>
                      </div>
                      <p>
                        {event.email} · {new Date(event.at).toLocaleString()}
                      </p>
                      <p className="admin-activity-meta">
                        IP {event.ip}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
