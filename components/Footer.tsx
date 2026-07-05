import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SOCIAL } from "@/lib/social";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="om">ॐ</div>
          <h3>Om At Home</h3>
          <p>
            Live virtual yoga with Fillie Faragi — connecting practitioners in 40+
            countries, every day.
          </p>
        </div>
        <div className="footer-nav">
          <p className="footer-heading">Pages</p>
          <ul className="footer-links">
            <li><Link href={ROUTES.home}>Home</Link></li>
            <li><Link href={ROUTES.classes}>Classes</Link></li>
            <li><Link href={ROUTES.schedule}>Schedule</Link></li>
            <li><Link href={ROUTES.sunset}>Sunset Flow</Link></li>
            <li><Link href={ROUTES.teacher}>Teacher</Link></li>
            <li><Link href={ROUTES.pricing}>Pricing</Link></li>
            <li><Link href={ROUTES.bookApp}>Book Your Mat</Link></li>
          </ul>
        </div>
        <div className="footer-connect">
          <p className="footer-heading">Connect</p>
          <div className="footer-socials">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-instagram" /></svg>
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-facebook" /></svg>
            </a>
            <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-youtube" /></svg>
            </a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-tiktok" /></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="chakra-strip">
          {["r", "o", "y", "g", "b", "i", "v"].map((c) => (
            <div key={c} className="chakra-dot" style={{ background: `var(--chakra-${c})` }} />
          ))}
        </div>
        <small>© 2026 Om At Home · All rights reserved</small>
      </div>
    </footer>
  );
}
