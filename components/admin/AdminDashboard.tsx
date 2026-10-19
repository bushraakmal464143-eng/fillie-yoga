"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ROUTES } from "@/lib/routes";
import { useAdminAuth } from "./AdminAuthProvider";

const SECTIONS = [
  {
    href: ROUTES.adminClassCards,
    label: "Class cards",
    description: "Public class list on the Classes page",
    countKey: "offers" as const,
  },
  {
    href: ROUTES.adminSessions,
    label: "Sessions",
    description: "Weekly schedule times and Zoom links",
    countKey: "sessions" as const,
  },
  {
    href: ROUTES.adminPricing,
    label: "Pricing",
    description: "Membership plans and prices",
    countKey: "pricing" as const,
  },
  {
    href: ROUTES.adminMembers,
    label: "Members",
    description: "People who created an account",
    countKey: "members" as const,
  },
  {
    href: ROUTES.adminSubscriptions,
    label: "Subscriptions",
    description: "Paid Stripe memberships",
    countKey: "subscriptions" as const,
  },
  {
    href: ROUTES.adminBookings,
    label: "Bookings",
    description: "Trial lessons and class bookings",
    countKey: "bookings" as const,
  },
] as const;

export default function AdminDashboard() {
  const { counts, refreshKey, refreshCounts } = useAdminAuth();

  useEffect(() => {
    void refreshCounts();
  }, [refreshKey, refreshCounts]);

  return (
    <section className="admin-home">
      <header className="admin-home-head">
        <h2>Dashboard</h2>
        <p>Open a section to edit content or review activity.</p>
      </header>

      <div className="admin-dash-list" aria-label="Admin sections">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="admin-dash-row">
            <div className="admin-dash-row-copy">
              <strong>{section.label}</strong>
              <span>{section.description}</span>
            </div>
            <div className="admin-dash-row-meta">
              <span className="admin-dash-row-count">{counts[section.countKey] ?? 0}</span>
              <span className="admin-dash-row-go" aria-hidden="true">
                Open
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
