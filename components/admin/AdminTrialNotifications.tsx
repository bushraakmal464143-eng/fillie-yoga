"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTES } from "@/lib/routes";
import type { AdminTrialNotification } from "@/lib/admin-members";

const SEEN_KEY = "omathome_admin_seen_trial_ids";
const POLL_MS = 15_000;

function readSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(-80)));
  } catch {
    // ignore
  }
}

function formatBookedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminTrialNotifications() {
  const [latest, setLatest] = useState<AdminTrialNotification[]>([]);
  const [toast, setToast] = useState<AdminTrialNotification | null>(null);
  const primed = useRef(false);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((item: AdminTrialNotification) => {
    setToast(item);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 9000);
  }, []);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/notifications");
    if (response.status === 401 || !response.ok) return;

    const data = (await response.json()) as {
      notifications?: AdminTrialNotification[];
    };
    const next = data.notifications ?? [];
    setLatest(next.slice(0, 3));

    const seen = readSeenIds();
    const fresh = next.filter((item) => !seen.has(item.id));

    if (!primed.current) {
      primed.current = true;
      next.forEach((item) => seen.add(item.id));
      writeSeenIds(seen);
      return;
    }

    if (fresh.length > 0) {
      showToast(fresh[0]);
      fresh.forEach((item) => seen.add(item.id));
      writeSeenIds(seen);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => {
      window.clearInterval(timer);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [load]);

  return (
    <>
      {toast && (
        <aside className="admin-toast" role="status" aria-live="polite">
          <div className="admin-toast-body">
            <p className="admin-toast-kicker">New trial lesson</p>
            <p className="admin-toast-title">
              {toast.guestName} booked a trial lesson
            </p>
            <p className="admin-toast-meta">
              {toast.guestEmail}
              <br />
              {toast.classType} · {toast.day} · {toast.time} · {toast.duration}
            </p>
          </div>
          <button
            type="button"
            className="admin-toast-close"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </aside>
      )}

      <section className="admin-trial-strip" aria-label="Recent trial bookings">
        <div className="admin-trial-strip-head">
          <div>
            <p className="admin-trial-strip-kicker">Trial lessons</p>
            <h2>Latest bookings</h2>
          </div>
          <Link href={ROUTES.adminBookings} className="admin-trial-strip-link">
            View all
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="admin-trial-strip-empty">No trial lessons booked yet.</p>
        ) : (
          <ul className="admin-trial-strip-list">
            {latest.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.guestName}</strong>
                  <span>{item.guestEmail}</span>
                </div>
                <div>
                  <strong>
                    {item.classType}
                  </strong>
                  <span>
                    {item.day} · {item.time} · {item.duration}
                  </span>
                </div>
                <time dateTime={item.bookedAt}>{formatBookedAt(item.bookedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
