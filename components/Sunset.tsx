"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function Sunset() {
  const { goToBookApp } = useApp();

  return (
    <section id="sunset" className="sunset-section">
      <div className="sunset-ambient" aria-hidden="true">
        <div className="sunset-orb sunset-orb--1" />
        <div className="sunset-orb sunset-orb--2" />
      </div>
      <div className="container sunset-inner">
        <p className="section-label reveal" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
          Special live experience
        </p>
        <h2 className="section-title reveal" style={{ "--reveal-delay": 1 } as React.CSSProperties}>
          Sunset Flow: Live from Giza
        </h2>
        <div className="sunset-divider reveal" style={{ "--reveal-delay": 3 } as React.CSSProperties} aria-hidden="true">
          <span />
        </div>
        <div className="sunset-card-big reveal" style={{ "--reveal-delay": 4 } as React.CSSProperties}>
          <div className="sunset-icon-big">
            <div className="sunset-icon-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <use href="#icon-sunset" />
              </svg>
            </div>
            <div className="sunset-icon-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <use href="#icon-pyramid" />
              </svg>
            </div>
          </div>
          <h3>Where ancient energy meets global community</h3>
          <p>
            Once every three months, Fillie leads a live yoga flow from the base
            of the Giza Pyramids as the Egyptian sun sets behind them. Thousands
            of practitioners around the world roll out their mats at the same
            moment — connected by breath, movement, and one of the world&apos;s
            most sacred landscapes.
          </p>
          <div className="next-event">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <use href="#icon-calendar" />
            </svg>
            Next event: September 2026 · Date announced to subscribers
          </div>
          <button className="sub-btn sunset-cta" type="button" onClick={goToBookApp}>
            Subscribe to get notified
          </button>
        </div>
      </div>
    </section>
  );
}
