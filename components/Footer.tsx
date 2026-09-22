import Link from "next/link";
import { CONTACT_EMAIL, ROUTES } from "@/lib/routes";
import { INSTAGRAM_HANDLE, SOCIAL } from "@/lib/social";

const PRACTICE_LINKS = [
  { href: ROUTES.classes, label: "Classes" },
  { href: ROUTES.schedule, label: "Schedule" },
  { href: ROUTES.sunset, label: "Sunset Flow" },
  { href: ROUTES.teacher, label: "Teacher" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.bookApp, label: "Book Your Mat" },
] as const;

const WELLNESS_LINKS = [
  { href: ROUTES.reiki, label: "Distance Reiki" },
  { href: ROUTES.dowsing, label: "Ask the Rods" },
] as const;

export default function Footer() {
  return (
    <footer>
      <div className="footer-glow" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href={ROUTES.home} className="footer-logo">
            <span className="om">ॐ</span>
            <span className="name">Om At Home</span>
          </Link>
          <p>
            Live virtual yoga with Fillie Faragi — connecting practitioners in 40+
            countries, every day.
          </p>
          <Link href={ROUTES.bookApp} className="footer-cta">
            Reserve your mat
          </Link>
        </div>

        <div className="footer-nav">
          <p className="footer-heading">Practice</p>
          <ul className="footer-links">
            {PRACTICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-nav">
          <p className="footer-heading">Wellness</p>
          <ul className="footer-links">
            {WELLNESS_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link href={ROUTES.home}>Home</Link>
            </li>
          </ul>
        </div>

        <div className="footer-connect">
          <p className="footer-heading">Connect</p>
          <div className="footer-socials">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <use href="#icon-instagram" />
              </svg>
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <use href="#icon-facebook" />
              </svg>
            </a>
            <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <use href="#icon-youtube" />
              </svg>
            </a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <use href="#icon-tiktok" />
              </svg>
            </a>
          </div>
          <a
            className="footer-handle"
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            {INSTAGRAM_HANDLE}
          </a>
          <a className="footer-email" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="chakra-strip" aria-hidden="true">
          {["r", "o", "y", "g", "b", "i", "v"].map((c) => (
            <div key={c} className="chakra-dot" style={{ background: `var(--chakra-${c})` }} />
          ))}
        </div>
        <small>© {new Date().getFullYear()} Om At Home · All rights reserved</small>
      </div>
    </footer>
  );
}
