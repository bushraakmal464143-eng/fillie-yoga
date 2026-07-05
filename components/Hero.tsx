"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { ROUTES } from "@/lib/routes";

const TRUST_ITEMS = [
  "Live daily classes",
  "All levels welcome",
  "Practice from anywhere",
] as const;

export default function Hero() {
  const { openTrial } = useApp();
  const [dots, setDots] = useState<
    { left: number; top: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 35 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 5,
        delay: Math.random() * 4,
      })),
    );
  }, []);

  return (
    <section className="hero">
      <div className="hero-ambient" aria-hidden="true">
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />
        <div className="hero-globe" />
        <div className="world-dots" id="world-dots">
          {dots.map((d, i) => (
            <div
              key={i}
              className="wdot"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                // @ts-expect-error CSS custom properties
                "--d": `${d.duration}s`,
                "--dl": `${d.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="hero-om">ॐ</div>
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">A global virtual yoga community</p>
          <h1>
            Breathe in.
            <br />
            <em>Belong everywhere.</em>
          </h1>
          <p className="hero-sub">
            Live Yin, Vinyasa, and Pilates with Fillie Faragi — streamed daily to
            practitioners across every continent, from the comfort of home.
          </p>

          <ul className="hero-trust">
            {TRUST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="hero-actions">
            <button className="btn-primary" type="button" onClick={openTrial}>
              Book a free trial
            </button>
            <Link href={ROUTES.classes} className="btn-ghost">
              Explore classes
            </Link>
          </div>

          <div className="chakra-strip">
            {["r", "o", "y", "g", "b", "i", "v"].map((c) => (
              <div
                key={c}
                className="chakra-dot"
                style={{ background: `var(--chakra-${c})` }}
              />
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-frame">
            <Image
              src="/assets/images/om-at-home-promo.png"
              alt="Fillie Faragi leading a live virtual yoga class"
              width={560}
              height={700}
              priority
              className="hero-image"
            />
            <div className="hero-image-glow" aria-hidden="true" />
          </div>
          <div className="hero-float-card">
            <span className="hero-float-dot" aria-hidden="true" />
            <div>
              <strong>40+ countries</strong>
              <span>Practicing together, live</span>
            </div>
          </div>
        </div>
      </div>

      <a href="#practice" className="hero-scroll" aria-label="Scroll to explore">
        <span>Discover</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <div className="hero-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="var(--cream)" />
        </svg>
      </div>
    </section>
  );

}
