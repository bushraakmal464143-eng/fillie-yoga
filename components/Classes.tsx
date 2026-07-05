import type { ClassOffer } from "@/lib/types";

type ClassesProps = {
  offers: ClassOffer[];
};

export default function Classes({ offers }: ClassesProps) {
  return (
    <section id="classes" className="classes-bg">
      <div className="container">
        <p className="section-label" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
          What we offer
        </p>
        <h2 className="section-title">Move with the world</h2>
        <p
          style={{
            color: "var(--clay)",
            maxWidth: 520,
            fontSize: 15,
          }}
        >
          {offers.length} live class{offers.length === 1 ? "" : "es"} daily, led by Fillie Faragi and
          shared with practitioners across every continent.
        </p>
        <div className="classes-grid">
          {offers.map((c) => (
            <div
              key={c.id}
              className={`class-card ${c.key}`}
              style={
                {
                  "--card-accent":
                    c.key === "sunset-card"
                      ? "linear-gradient(90deg, #d4a017, #e67e22)"
                      : c.iconColor,
                } as React.CSSProperties
              }
            >
              {c.special && <div className="special-badge">✨ Special Event</div>}
              <div
                className="class-icon"
                style={{ background: c.iconBg, color: c.iconColor }}
              >
                <svg viewBox={c.vb} aria-hidden="true">
                  <use href={`#${c.icon}`} />
                </svg>
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span
                className="class-tag"
                style={{ background: c.tagBg, color: c.tagColor }}
              >
                {c.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
