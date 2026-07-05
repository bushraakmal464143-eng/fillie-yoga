import Image from "next/image";
import { FLAG_CODES } from "@/lib/schedule";
import { INSTAGRAM_HANDLE, SOCIAL } from "@/lib/social";

const STATS = [
  { value: "40+", label: "Countries" },
  { value: "5", label: "Classes daily" },
  { value: "7", label: "Days a week" },
  { value: "1", label: "Community" },
] as const;

export default function CommunityBand() {
  return (
    <div className="community-band">
      <div className="community-ambient" aria-hidden="true">
        <div className="community-orb community-orb--1" />
        <div className="community-orb community-orb--2" />
        <div className="community-orb community-orb--3" />
      </div>

      <div className="container community-inner">
        <p
          className="section-label community-eyebrow reveal"
          style={{ "--reveal-delay": 0 } as React.CSSProperties}
        >
          Our community
        </p>
        <h2 className="community-title reveal" style={{ "--reveal-delay": 1 } as React.CSSProperties}>
          Practice together,
          <br />
          <em>from everywhere</em>
        </h2>
        <div
          className="community-divider reveal"
          style={{ "--reveal-delay": 2 } as React.CSSProperties}
          aria-hidden="true"
        >
          <span />
        </div>
        <p className="community-copy reveal" style={{ "--reveal-delay": 2 } as React.CSSProperties}>
          When you roll out your mat at home, you&apos;re joining thousands of
          practitioners around the world doing the same thing at the same time.
          That shared energy — across cities, continents, and time zones — is what
          makes Om At Home unlike anything else.
        </p>

        <div className="community-stats-panel reveal" style={{ "--reveal-delay": 3 } as React.CSSProperties}>
          <div className="globe-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="gstat">
                <div className="gstat-num">{stat.value}</div>
                <div className="gstat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="community-flags-wrap reveal" style={{ "--reveal-delay": 4 } as React.CSSProperties}>
          <p className="community-flags-label">Practitioners joining live from</p>
          <div className="country-flags" aria-label="Practitioners from 9 countries worldwide">
            {FLAG_CODES.map(({ code, name }) => (
              <Image
                key={code}
                src={`/assets/flags/${code}.svg`}
                alt={name}
                title={name}
                width={36}
                height={27}
              />
            ))}
          </div>
        </div>

        <a
          href={SOCIAL.instagram}
          className="instagram-cta reveal"
          target="_blank"
          rel="noopener noreferrer"
          style={{ "--reveal-delay": 5 } as React.CSSProperties}
        >
          <span className="instagram-cta-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <use href="#icon-instagram" />
            </svg>
          </span>
          Follow {INSTAGRAM_HANDLE} on Instagram
        </a>
      </div>
    </div>
  );
}
