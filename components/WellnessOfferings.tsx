import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const OFFERINGS = [
  {
    href: ROUTES.reiki,
    eyebrow: "Energy healing",
    title: "Distance Reiki",
    lead: "Healing energy knows no distance.",
    blurb:
      "A gentle session you can receive from anywhere in the world. Rest, set an intention, and allow yourself to receive.",
    meta: "From $25 · Available worldwide",
  },
  {
    href: ROUTES.dowsing,
    eyebrow: "Intuitive guidance",
    title: "Ask the Rods",
    lead: "You bring the questions. The rods bring the mystery.",
    blurb:
      "Live or recorded dowsing with Fillie — yes-or-no questions answered with playful, intuitive perspective.",
    meta: "From $10 · Live or recorded",
  },
] as const;

export default function WellnessOfferings() {
  return (
    <section id="wellness" className="wellness-section">
      <div className="container">
        <p className="section-label">Beyond the mat</p>
        <h2 className="section-title">Wellness &amp; intuition</h2>
        <p className="wellness-intro">
          Alongside daily live yoga, Om At Home offers Distance Reiki and dowsing — gentle practices
          you can receive from anywhere.
        </p>
        <div className="wellness-grid">
          {OFFERINGS.map((item) => (
            <article key={item.href} className="wellness-card">
              <p className="wellness-eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p className="wellness-lead">{item.lead}</p>
              <p>{item.blurb}</p>
              <p className="wellness-meta">{item.meta}</p>
              <Link href={item.href} className="btn-primary wellness-cta">
                Learn more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
