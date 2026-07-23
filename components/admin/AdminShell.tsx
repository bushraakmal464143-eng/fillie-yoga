"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useAdminAuth } from "./AdminAuthProvider";

const NAV_LINKS = [
  { href: ROUTES.admin, label: "Dashboard", exact: true },
  { href: ROUTES.adminClassCards, label: "Class cards" },
  { href: ROUTES.adminSessions, label: "Sessions" },
  { href: ROUTES.adminPricing, label: "Pricing" },
  { href: ROUTES.adminMembers, label: "Members" },
  { href: ROUTES.adminSubscriptions, label: "Subscriptions" },
  { href: ROUTES.adminBookings, label: "Bookings" },
] as const;

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { error, success, refresh, logout, setError } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    closeMenu();
    setError("");
  }, [pathname, setError]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-top">
          {menuOpen && (
            <button
              type="button"
              className="admin-menu-overlay"
              aria-label="Close menu"
              onClick={closeMenu}
            />
          )}
          <div className="admin-brand">
            <span className="om" aria-hidden="true">
              ॐ
            </span>
            <div>
              <p className="admin-eyebrow">Content studio</p>
              <h1>Class admin</h1>
              <p>Shape what members see on Classes, Schedule, and Pricing.</p>
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
            <nav className="admin-nav" aria-label="Admin sections">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href, "exact" in link ? link.exact : false);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`admin-nav-link${active ? " is-active" : ""}`}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="admin-actions-tools">
              <Link href={ROUTES.classes} className="admin-btn-secondary" onClick={closeMenu}>
                View classes
              </Link>
              <Link href={ROUTES.pricing} className="admin-btn-secondary" onClick={closeMenu}>
                View pricing
              </Link>
              <button
                className="admin-btn-secondary"
                type="button"
                onClick={() => {
                  closeMenu();
                  refresh();
                }}
              >
                Refresh
              </button>
              <button
                className="admin-btn admin-btn--ghost"
                type="button"
                onClick={() => {
                  closeMenu();
                  void logout();
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <nav className="admin-nav admin-nav--bar" aria-label="Admin sections">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href, "exact" in link ? link.exact : false);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {error && (
          <p className="admin-banner admin-banner--error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="admin-banner admin-banner--success" role="status">
            {success}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
