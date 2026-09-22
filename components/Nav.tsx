"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useBookTrial } from "@/components/hooks/useBookTrial";
import { ROUTES } from "@/lib/routes";
import type { User } from "@/lib/types";

const NAV_LINKS = [
  { href: ROUTES.classes, label: "Classes" },
  { href: ROUTES.schedule, label: "Schedule" },
  { href: ROUTES.reiki, label: "Reiki" },
  { href: ROUTES.dowsing, label: "Dowsing" },
  { href: ROUTES.sunset, label: "Sunset Flow" },
  { href: ROUTES.teacher, label: "Teacher" },
  { href: ROUTES.pricing, label: "Pricing" },
] as const;

function welcomeLabel(user: User) {
  const raw = user.name?.trim() || user.email?.split("@")[0] || "friend";
  return raw.split(/\s+/)[0];
}

function IconLogin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M10 7V5.75A2.75 2.75 0 0 1 12.75 3h5.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21h-5.5A2.75 2.75 0 0 1 10 18.25V17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M3.5 12H14m0 0-3.25-3.25M14 12l-3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSignup({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="10" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.75 19.25c1.45-2.8 3.55-4.25 6.25-4.25 1.05 0 2 .22 2.85.62"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M17.5 11.5v6M14.5 14.5h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect
        x="3.75"
        y="5.75"
        width="16.5"
        height="14.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M8 3.75v3.5M16 3.75v3.5M3.75 10.5h16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function Nav() {
  const bookTrial = useBookTrial();
  const { user, authReady, openAuth, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname, user]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/" && href === ROUTES.sunset;
    return pathname === href;
  };

  const welcome = user ? welcomeLabel(user) : null;

  return (
    <nav>
      {menuOpen && (
        <button
          type="button"
          className="nav-overlay"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
      <Link href={ROUTES.home} className="nav-logo" onClick={closeMenu}>
        <span className="om">ॐ</span>
        <span className="name">Om At Home</span>
      </Link>
      <div className={`nav-menu${menuOpen ? " is-open" : ""}`} id="nav-menu">
        <ul className="nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={isActive(href) ? "is-active" : undefined}
                onClick={closeMenu}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-auth-mobile">
          {authReady && user ? (
            <>
              <div className="nav-user-chip">
                <span className="nav-profile-avatar" aria-hidden="true">
                  {(welcome ?? "U").charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-name">Welcome, {welcome}</span>
              </div>
              <button
                className="nav-auth"
                type="button"
                onClick={() => {
                  void logout();
                  closeMenu();
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-auth"
                type="button"
                onClick={() => {
                  openAuth("login");
                  closeMenu();
                }}
              >
                <IconLogin className="nav-icon" />
                Log in
              </button>
              <button
                className="nav-auth nav-auth--primary"
                type="button"
                onClick={() => {
                  openAuth("signup");
                  closeMenu();
                }}
              >
                <IconSignup className="nav-icon" />
                Sign up
              </button>
            </>
          )}
        </div>
        <button
          className="nav-trial nav-trial-mobile"
          type="button"
          onClick={() => {
            bookTrial();
            closeMenu();
          }}
        >
          <IconCalendar className="nav-icon" />
          Book a trial
        </button>
      </div>
      <div className="nav-end">
        {authReady && user ? (
          <div className="nav-profile" ref={profileRef}>
            <button
              className={`nav-profile-btn${profileOpen ? " is-open" : ""}`}
              type="button"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              title={user.email}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="nav-profile-avatar" aria-hidden="true">
                {(welcome ?? "U").charAt(0).toUpperCase()}
              </span>
              <span className="nav-profile-label">
                <span className="nav-profile-hello">Hi,</span> {welcome}
              </span>
              <svg className="nav-profile-caret" viewBox="0 0 20 20" aria-hidden="true" fill="none">
                <path
                  d="M5.5 7.75 10 12.25l4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {profileOpen && (
              <div className="nav-profile-menu" role="menu">
                <p className="nav-profile-name">{user.name?.trim() || welcome}</p>
                <p className="nav-profile-email">{user.email}</p>
                <button
                  className="nav-profile-logout"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-auth-desktop">
            <button
              className="nav-btn"
              type="button"
              onClick={() => openAuth("login")}
            >
              <IconLogin className="nav-icon" />
              Log in
            </button>
            <button
              className="nav-btn nav-btn--primary"
              type="button"
              onClick={() => openAuth("signup")}
            >
              <IconSignup className="nav-icon" />
              Sign up
            </button>
            <button
              className="nav-btn nav-btn--trial"
              type="button"
              onClick={() => bookTrial()}
            >
              <IconCalendar className="nav-icon" />
              Book a trial
            </button>
          </div>
        )}
        <button
          className="nav-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
