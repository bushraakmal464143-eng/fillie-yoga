"use client";

import type { ClassOffer } from "@/lib/types";
import { useBookTrial } from "@/components/hooks/useBookTrial";

type ClassesProps = {
  offers: ClassOffer[];
};

export default function Classes({ offers }: ClassesProps) {
  const bookTrial = useBookTrial();

  return (
    <section id="classes" className="classes-bg">
      <div className="container">
        <div className="classes-intro">
          <p className="section-label" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
            What we offer
          </p>
          <h2 className="section-title">Move with the world</h2>
          <p>
            {offers.length} live class{offers.length === 1 ? "" : "es"} daily, led by Fillie Faragi and
            shared with practitioners across every continent.
          </p>
        </div>
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
              <div className="class-card-footer">
                <span
                  className="class-tag"
                  style={{ background: c.tagBg, color: c.tagColor }}
                >
                  {c.tag}
                </span>
                <button
                  className="class-book-btn"
                  type="button"
                  onClick={() => bookTrial(c.title)}
                >
                  Book class
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
