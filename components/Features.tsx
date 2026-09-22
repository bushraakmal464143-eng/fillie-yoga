import Link from "next/link";
import { getIconMeta } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";

const FEATURES = [
  {
    title: "Live daily classes",
    desc: "Five live sessions every day — Yin, Vinyasa, Pilates, Heart Opening Yin, and more — so there's always a class that fits your time zone.",
    icon: "icon-calendar",
    color: "#c0392b",
    bg: "rgba(192, 57, 43, 0.1)",
  },
  {
    title: "All levels welcome",
    desc: "Whether you're brand new to the mat or years into your practice, every class is guided so you can move at a pace that feels right.",
    icon: "icon-yin",
    color: "#7b3fa0",
    bg: "rgba(123, 63, 160, 0.1)",
  },
  {
    title: "Practice from anywhere",
    desc: "Join from your living room in any of 40+ countries. Same teacher, same energy, wherever you unroll your mat.",
    icon: "icon-map-pin",
    color: "#2980b9",
    bg: "rgba(41, 128, 185, 0.1)",
  },
  {
    title: "Free trial class",
    desc: "Book one complimentary live session before you subscribe — no contracts, no pressure, just show up and breathe.",
    icon: "icon-vinyasa",
    color: "#1e6fa8",
    bg: "rgba(30, 111, 168, 0.1)",
  },
  {
    title: "Live with Fillie",
    desc: "Every class is taught live by Fillie Faragi — real-time cueing, presence, and community, not a pre-recorded feed.",
    icon: "icon-heart-yin",
    color: "#a07010",
    bg: "rgba(212, 160, 23, 0.12)",
  },
  {
    title: "Beyond the mat",
    desc: "Distance Reiki, Ask the Rods dowsing, and quarterly Sunset Flow from the Giza Pyramids — wellness that travels with you.",
    icon: "icon-pyramid",
    color: "#1e7a4a",
    bg: "rgba(30, 122, 74, 0.1)",
  },
] as const;

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <p className="section-label reveal" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
          Why Om At Home
        </p>
        <h2 className="section-title reveal" style={{ "--reveal-delay": 1 } as React.CSSProperties}>
          Everything you need
          <br />
          <em>to practice together</em>
        </h2>
        <p className="features-lead reveal" style={{ "--reveal-delay": 2 } as React.CSSProperties}>
          From daily live classes to global community and gentle wellness offerings —
          built for people who want to belong on the mat, wherever they are.
        </p>

        <div className="features-grid">
          {FEATURES.map((feature, index) => {
            const icon = getIconMeta(feature.icon);
            return (
              <article
                key={feature.title}
                className="feature-card reveal"
                style={
                  {
                    "--reveal-delay": index + 3,
                    "--feature-color": feature.color,
                    "--feature-bg": feature.bg,
                  } as React.CSSProperties
                }
              >
                <div className="feature-icon">
                  <svg viewBox={icon.vb} aria-hidden="true">
                    <use href={`#${icon.id}`} />
                  </svg>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            );
          })}
        </div>

        <div className="features-cta reveal" style={{ "--reveal-delay": 9 } as React.CSSProperties}>
          <Link href={ROUTES.pricing} className="btn-primary">
            See membership
          </Link>
          <Link href={ROUTES.schedule} className="btn-outline">
            Browse the schedule
          </Link>
        </div>
      </div>
    </section>
  );
}
