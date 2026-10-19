"use client";

import Link from "next/link";
import { useJoinClass } from "@/components/hooks/useJoinClass";
import { useApp } from "@/components/providers/AppProvider";
import { getIconMeta } from "@/lib/icons";
import { resolveMeetingUrl } from "@/lib/meeting-url";
import { ROUTES } from "@/lib/routes";

const FALLBACK_PRACTICES = [
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
  {
    title: "Heart Opening Yin",
    desc: "Gentle chest and shoulder openers that invite softness, breath, and emotional release.",
    icon: "icon-heart-yin",
    color: "#a07010",
    bg: "rgba(212, 160, 23, 0.12)",
  },
  {
    title: "Sunset Flow",
    desc: "A special live practice streamed from the Giza Pyramids — shared across the globe each quarter.",
    icon: "icon-sunset",
    color: "#c0392b",
    bg: "rgba(192, 57, 43, 0.1)",
  },
] as const;

export default function HomePractice() {
  const { offers } = useApp();
  const { joinClass, checkoutLoading, joinHint } = useJoinClass();

  const cards =
    offers.length > 0
      ? offers.map((offer) => ({
          key: offer.id,
          title: offer.title,
          desc: offer.desc,
          icon: offer.icon,
          color: offer.iconColor,
          bg: offer.iconBg,
          meetingUrl: resolveMeetingUrl({ type: offer.title, meetingUrl: offer.meetingUrl }, offers),
        }))
      : FALLBACK_PRACTICES.map((practice) => ({
          key: practice.title,
          title: practice.title,
          desc: practice.desc,
          icon: practice.icon,
          color: practice.color,
          bg: practice.bg,
          meetingUrl: resolveMeetingUrl({ type: practice.title }, offers),
        }));

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
          Live classes led by Fillie Faragi — log in, subscribe, then join on Zoom.
        </p>

        <div className="practice-grid">
          {cards.map((practice) => {
            const icon = getIconMeta(practice.icon);
            return (
              <article
                key={practice.key}
                className="practice-card"
                style={
                  {
                    "--practice-color": practice.color,
                    "--practice-bg": practice.bg,
                  } as React.CSSProperties
                }
              >
                <div className="practice-icon">
                  <svg viewBox={icon.vb} aria-hidden="true">
                    <use href={`#${icon.id}`} />
                  </svg>
                </div>
                <h3>{practice.title}</h3>
                <p>{practice.desc}</p>
                <button
                  className="practice-join-btn"
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => joinClass(practice.meetingUrl)}
                >
                  {checkoutLoading ? "Redirecting…" : "Join class"}
                </button>
              </article>
            );
          })}
        </div>

        {joinHint && (
          <p className="home-practice-error" role="alert">
            {joinHint}
          </p>
        )}

        <div className="home-practice-cta reveal" style={{ "--reveal-delay": 8 } as React.CSSProperties}>
          <Link href={ROUTES.classes} className="btn-primary">
            View classes & schedule
          </Link>
          <Link href={ROUTES.pricing} className="btn-outline">
            See membership
          </Link>
        </div>
      </div>
    </section>
  );
}
