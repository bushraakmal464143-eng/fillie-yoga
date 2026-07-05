import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const PRACTICES = [
  {
    title: "Yin Yoga Flow",
    desc: "Slow, meditative holds that open the body and quiet the mind — perfect for evening practice.",
    icon: "icon-yin",
    color: "#7b3fa0",
    bg: "rgba(123, 63, 160, 0.1)",
  },
  {
    title: "Vinyasa Flow",
    desc: "Breath-led movement that builds strength, flexibility, and energy for your day.",
    icon: "icon-vinyasa",
    color: "#1e6fa8",
    bg: "rgba(30, 111, 168, 0.1)",
  },
  {
    title: "Pilates",
    desc: "Core-focused conditioning that supports alignment, posture, and mindful control.",
    icon: "icon-pilates",
    color: "#1e7a4a",
    bg: "rgba(30, 122, 74, 0.1)",
  },
] as const;

export default function HomePractice() {
  return (
        <section className="home-practice" id="practice">
      <div className="container">
        <p className="section-label reveal" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
          Your practice
        </p>
        <h2 className="section-title reveal" style={{ "--reveal-delay": 1 } as React.CSSProperties}>
          Move with intention,
          <br />
          <em>at your own pace</em>
        </h2>
        <p className="home-practice-lead reveal" style={{ "--reveal-delay": 2 } as React.CSSProperties}>
          Live classes led by Fillie Faragi — designed for every body, every timezone,
          and every stage of your yoga journey.
        </p>

        <div className="practice-grid">
          {PRACTICES.map((practice, index) => (
            <article
              key={practice.title}
              className="practice-card reveal"
              style={
                {
                  "--reveal-delay": index + 3,
                  "--practice-color": practice.color,
                  "--practice-bg": practice.bg,
                } as React.CSSProperties
              }
            >
              <div className="practice-icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <use href={`#${practice.icon}`} />
                </svg>
              </div>
              <h3>{practice.title}</h3>
              <p>{practice.desc}</p>
            </article>
          ))}
        </div>

        <div className="home-practice-cta reveal" style={{ "--reveal-delay": 6 } as React.CSSProperties}>
          <Link href={ROUTES.classes} className="btn-primary">
            View all classes
          </Link>
          <Link href={ROUTES.schedule} className="btn-outline">
            See weekly schedule
          </Link>
        </div>
      </div>
    </section>
  );
}
