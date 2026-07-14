"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ROUTES } from "@/lib/routes";

type Subscriber = {
  subscriptionId: string;
  status: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  addressLine: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  createdAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  cardBrand: string;
  cardLast4: string;
};

export default function AdminSubscribersPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadSubscribers = useCallback(async () => {
    const response = await fetch("/api/admin/subscribers");
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }

    setAuthenticated(true);
    const data = (await response.json()) as {
      subscribers?: Subscriber[];
      activeCount?: number;
      error?: string;
    };

    if (data.error) {
      setError(data.error);
      setSubscribers([]);
      setActiveCount(0);
      return;
    }

    setError("");
    const rows = data.subscribers ?? [];
    setSubscribers(rows);
    setActiveCount(data.activeCount ?? 0);
    setSelectedId((current) => current ?? rows[0]?.subscriptionId ?? null);
  }, []);

  useEffect(() => {
    void (async () => {
      const authRes = await fetch("/api/admin/auth");
      const authData = (await authRes.json()) as { authenticated: boolean };
      if (!authData.authenticated) {
        setAuthenticated(false);
        return;
      }
      await loadSubscribers();
    })();
  }, [loadSubscribers]);

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
    await loadSubscribers();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setSubscribers([]);
    setSelectedId(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((sub) => {
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        sub.name,
        sub.email,
        sub.phone,
        sub.country,
        sub.city,
        sub.state,
        sub.postalCode,
        sub.addressLine,
        sub.planName,
        sub.subscriptionId,
        sub.customerId,
        sub.cardLast4,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [subscribers, query, statusFilter]);

  const selected =
    filtered.find((sub) => sub.subscriptionId === selectedId) ??
    filtered[0] ??
    null;

  if (authenticated === null) {
    return (
      <div className="admin-page">
        <div className="admin-shell">Loading…</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-shell admin-shell--narrow">
          <form className="admin-login" onSubmit={handleLogin}>
            <h1>Subscribers admin</h1>
            <p>Sign in to view Stripe subscription details.</p>
            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && <p className="admin-error">{error}</p>}
            <button className="admin-btn" type="submit" disabled={busy} style={{ width: "100%", marginTop: "1rem" }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell admin-shell--subscribers">
        <div className="admin-top admin-top--bar">
          <div className="admin-brand">
            <span className="om">ॐ</span>
            <div>
              <p className="admin-kicker">Om At Home</p>
              <h1>Subscribers</h1>
              <p>
                {activeCount} active · {subscribers.length} total from Stripe
              </p>
            </div>
          </div>
          <div className="admin-actions">
            <Link href={ROUTES.admin} className="admin-btn-secondary">
              Back to admin
            </Link>
            <Link href={ROUTES.adminClasses} className="admin-btn-secondary">
              Classes
            </Link>
            <Link href={ROUTES.adminPricing} className="admin-btn-secondary">
              Pricing
            </Link>
            <button className="admin-btn-secondary" type="button" onClick={() => void loadSubscribers()}>
              Refresh
            </button>
            <button className="admin-btn-secondary" type="button" onClick={() => void handleLogout()}>
              Log out
            </button>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-sub-toolbar">
          <input
            className="admin-sub-search"
            type="search"
            placeholder="Search name, email, country, ID…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="admin-sub-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past due</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <section className="admin-card admin-card--wide">
            <p className="admin-hint">No subscribers match your filters.</p>
          </section>
        ) : (
          <div className="admin-sub-layout">
            <aside className="admin-card admin-sub-list-panel">
              <h2>All subscribers</h2>
              <div className="admin-sub-list">
                {filtered.map((sub) => (
                  <button
                    key={sub.subscriptionId}
                    type="button"
                    className={`admin-sub-list-item${selected?.subscriptionId === sub.subscriptionId ? " is-active" : ""}`}
                    onClick={() => setSelectedId(sub.subscriptionId)}
                  >
                    <strong>{sub.name !== "—" ? sub.name : sub.email}</strong>
                    <span>{sub.email}</span>
                    <span className={`admin-status admin-status--${sub.status}`}>{sub.status}</span>
                  </button>
                ))}
              </div>
            </aside>

            {selected && (
              <section className="admin-card admin-sub-detail-panel">
                <div className="admin-subscriber-top">
                  <div>
                    <h2>{selected.name !== "—" ? selected.name : selected.email}</h2>
                    <p className="admin-subscriber-meta">{selected.email}</p>
                  </div>
                  <span className={`admin-status admin-status--${selected.status}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="admin-sub-detail-grid">
                  <DetailGroup title="Contact">
                    <DetailItem label="Full name" value={selected.name} />
                    <DetailItem label="Email" value={selected.email} />
                    <DetailItem label="Phone" value={selected.phone} />
                  </DetailGroup>

                  <DetailGroup title="Location">
                    <DetailItem label="Address" value={selected.addressLine} />
                    <DetailItem label="City" value={selected.city} />
                    <DetailItem label="State / region" value={selected.state} />
                    <DetailItem label="Postal code" value={selected.postalCode} />
                    <DetailItem label="Country" value={selected.country} />
                  </DetailGroup>

                  <DetailGroup title="Subscription">
                    <DetailItem label="Plan" value={selected.planName} />
                    <DetailItem
                      label="Amount"
                      value={`${selected.currency} ${selected.amount}/${selected.interval}`}
                    />
                    <DetailItem label="Subscribed on" value={selected.createdAt} />
                    <DetailItem label="Period start" value={selected.currentPeriodStart} />
                    <DetailItem label="Period end" value={selected.currentPeriodEnd} />
                    <DetailItem label="Canceled at" value={selected.canceledAt ?? "—"} />
                  </DetailGroup>

                  <DetailGroup title="Payment">
                    <DetailItem label="Card brand" value={selected.cardBrand} />
                    <DetailItem label="Card last 4" value={selected.cardLast4} />
                  </DetailGroup>

                  <DetailGroup title="Stripe IDs">
                    <DetailItem label="Subscription ID" value={selected.subscriptionId} mono />
                    <DetailItem label="Customer ID" value={selected.customerId || "—"} mono />
                  </DetailGroup>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-sub-detail-group">
      <h3>{title}</h3>
      <dl>{children}</dl>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={mono ? "admin-mono" : undefined}>{value}</dd>
    </div>
  );
}
