"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ROUTES } from "@/lib/routes";
import { useAdminAuth } from "./AdminAuthProvider";

const SECTIONS = [
  {
    href: ROUTES.adminClassCards,
    label: "Class cards",
    description: "Overview cards on the public Classes page.",
    countKey: "offers" as const,
  },
  {
    href: ROUTES.adminSessions,
    label: "Sessions",
    description: "Schedule page and booking calendar sessions.",
    countKey: "sessions" as const,
  },
  {
    href: ROUTES.adminPricing,
    label: "Pricing",
    description: "Membership plans on Pricing and in the booking app.",
    countKey: "pricing" as const,
  },
  {
    href: ROUTES.adminMembers,
    label: "Members",
    description: "Who signed up for an account.",
    countKey: "members" as const,
  },
  {
    href: ROUTES.adminSubscriptions,
    label: "Subscriptions",
    description: "Paid memberships and plan status.",
    countKey: "subscriptions" as const,
  },
  {
    href: ROUTES.adminBookings,
    label: "Bookings",
    description: "Class bookings from members and guests.",
    countKey: "bookings" as const,
  },
] as const;

export default function AdminDashboard() {
  const { counts, refreshKey, refreshCounts } = useAdminAuth();

  useEffect(() => {
    void refreshCounts();
  }, [refreshKey, refreshCounts]);

  const summary = [
    SECTIONS[0],
    SECTIONS[1],
    SECTIONS[2],
    SECTIONS[3],
    SECTIONS[4],
  ];

  return (
    <>
      <div className="admin-stats" aria-label="Content summary">
        {summary.map((section) => (
          <Link key={section.href} href={section.href} className="admin-stat admin-stat--link">
            <span className="admin-stat-value">{counts[section.countKey]}</span>
            <span className="admin-stat-label">{section.label}</span>
          </Link>
        ))}
      </div>

      <section className="admin-card admin-card--wide">
        <div className="admin-card-head">
          <div>
            <p className="admin-card-kicker">Studio desk</p>
            <h2>Dashboard</h2>
          </div>
        </div>
        <p>Jump into a section to manage content or review member activity.</p>

        <div className="admin-dash-grid">
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} className="admin-dash-card">
              <span className="admin-dash-card-count">{counts[section.countKey]}</span>
              <strong>{section.label}</strong>
              <span>{section.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
