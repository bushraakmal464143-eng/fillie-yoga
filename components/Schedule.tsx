"use client";

import { useState } from "react";
import { ClassIcon } from "@/components/ClassIcon";
import { useApp } from "@/components/providers/AppProvider";
import { DAYS } from "@/lib/schedule";

export default function Schedule() {
  const { allClasses, offers } = useApp();
  const [activeDay, setActiveDay] = useState<string>("Monday");

  const dayClasses = allClasses.filter((c) => c.day === activeDay);

  return (
    <section id="schedule" className="schedule-bg">
      <div className="container">
        <p className="section-label" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
          Weekly schedule
        </p>
        <h2 className="section-title" style={{ "--reveal-delay": 1 } as React.CSSProperties}>
          Your week at a glance
        </h2>
        <p
          style={{
            color: "var(--clay)",
            maxWidth: 520,
            fontSize: 15,
            "--reveal-delay": 2,
          } as React.CSSProperties}
        >
          Five live sessions stream daily. Heart Opening Yin also runs Tuesday
          and Thursday mornings. Sunset Flow from Giza happens once every three
          months.
        </p>
        <div className="day-tabs" style={{ "--reveal-delay": 3 } as React.CSSProperties}>
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              className={`day-tab${d === activeDay ? " active" : ""}`}
              onClick={() => setActiveDay(d)}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="schedule-list">
          {dayClasses.map((c) => (
            <div key={c.id} className={`sched-card${c.special ? " special" : ""}`}>
              <div
                className="sched-type"
                style={{ background: c.bg, color: c.color }}
              >
                <ClassIcon type={c.type} color={c.color} offers={offers} />
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
