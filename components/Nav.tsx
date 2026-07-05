"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useApp } from "@/components/providers/AppProvider";
import { ROUTES } from "@/lib/routes";

const NAV_LINKS = [
  { href: ROUTES.classes, label: "Classes" },
  { href: ROUTES.schedule, label: "Schedule" },
  { href: ROUTES.sunset, label: "Sunset Flow" },
  { href: ROUTES.teacher, label: "Teacher" },
  { href: ROUTES.pricing, label: "Pricing" },
] as const;

export default function Nav() {
  const { openTrial } = useApp();
  const { user, authReady, openAuth, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/" && href === ROUTES.sunset;
    return pathname === href;
  };

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
              <span className="nav-user-name">Hi, {user.name.split(" ")[0]}</span>
              <button className="nav-auth" type="button" onClick={() => { void logout(); closeMenu(); }}>
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
                Sign up
              </button>
            </>
          )}
        </div>
        <button
          className="nav-trial nav-trial-mobile"
          type="button"
          onClick={() => {
            openTrial();
            closeMenu();
          }}
        >
          Book a trial
        </button>
      </div>
      <div className="nav-end">
        {authReady && user ? (
          <div className="nav-user">
            <span className="nav-user-name">Hi, {user.name.split(" ")[0]}</span>
            <button className="nav-auth" type="button" onClick={() => void logout()}>
              Log out
            </button>
          </div>
        ) : (
          <div className="nav-auth-desktop">
            <button className="nav-auth" type="button" onClick={() => openAuth("login")}>
              Log in
            </button>
            <button className="nav-auth nav-auth--primary" type="button" onClick={() => openAuth("signup")}>
              Sign up
            </button>
          </div>
        )}
        <button className="nav-trial" type="button" onClick={openTrial}>
          Book a trial
        </button>
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
