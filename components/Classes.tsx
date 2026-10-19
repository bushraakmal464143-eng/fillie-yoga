"use client";

import { useState } from "react";
import { ClassIcon } from "@/components/ClassIcon";
import { useBookTrial } from "@/components/hooks/useBookTrial";
import { useApp } from "@/components/providers/AppProvider";
import { DAYS } from "@/lib/schedule";
import type { ClassOffer } from "@/lib/types";

type ClassesProps = {
  offers: ClassOffer[];
};

export default function Classes({ offers }: ClassesProps) {
  const bookTrial = useBookTrial();
  const { allClasses, offers: liveOffers } = useApp();
  const [activeDay, setActiveDay] = useState<string>("Monday");
  const scheduleOffers = liveOffers.length ? liveOffers : offers;
  const dayClasses = allClasses.filter((c) => c.day === activeDay);

  return (
    <div className="classes-page">
      <section id="classes" className="classes-bg classes-page__offers">
        <div className="container">
          <div className="classes-intro">
            <p className="section-label">Classes & schedule</p>
            <h1 className="section-title">Move with the world</h1>
            <p>
              {offers.length} live class{offers.length === 1 ? "" : "es"} with Fillie Faragi — pick a
              practice below, then choose a time from the weekly schedule.
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

      <section id="schedule" className="schedule-bg classes-page__schedule">
        <div className="container">
          <div className="classes-schedule-intro">
            <p className="section-label">Weekly rhythm</p>
            <h2 className="section-title">Your week at a glance</h2>
            <p>
              Five live sessions stream daily. Heart Opening Yin also runs Tuesday and Thursday
              mornings. Sunset Flow from Giza happens once every three months.
            </p>
          </div>

          <div className="day-tabs" role="tablist" aria-label="Days of the week">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={d === activeDay}
                className={`day-tab${d === activeDay ? " active" : ""}`}
                onClick={() => setActiveDay(d)}
              >
                <span className="day-tab__short">{d.slice(0, 3)}</span>
                <span className="day-tab__full">{d}</span>
              </button>
            ))}
          </div>

          <div className="schedule-list" role="tabpanel" aria-label={`${activeDay} classes`}>
            {dayClasses.length === 0 ? (
              <p className="schedule-empty">No classes listed for {activeDay} yet.</p>
            ) : (
              dayClasses.map((c) => (
                <div key={c.id} className={`sched-card${c.special ? " special" : ""}`}>
                  <div className="sched-type" style={{ background: c.bg, color: c.color }}>
                    <ClassIcon type={c.type} color={c.color} offers={scheduleOffers} />
                  </div>
                  <div className="sched-info">
                    <div className="sched-name">{c.type}</div>
                    <div className="sched-meta">
                      {c.duration} · Fillie Faragi
                      {c.note ? ` · ${c.note}` : ""}
                    </div>
                  </div>
                  <div className="sched-right">
                    <div className="sched-time">{c.time}</div>
                    <div className="sched-spots">
                      {c.special ? "Global event" : `${c.spots} spots left`}
                    </div>
                    {!c.special && (
                      <button
                        className="sched-book-btn"
                        type="button"
                        onClick={() => bookTrial(c.type)}
                      >
                        Book
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
