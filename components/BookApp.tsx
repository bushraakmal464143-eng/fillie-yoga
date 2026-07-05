"use client";

import { FormEvent, useState } from "react";
import { ClassIcon } from "@/components/ClassIcon";
import { useApp } from "@/components/providers/AppProvider";
import { formatPlanPeriod } from "@/lib/pricing";
import { DAYS } from "@/lib/schedule";
import type { AppTab } from "@/lib/types";

const APP_TABS: { id: AppTab; label: string }[] = [
  { id: "trial", label: "Free Trial" },
  { id: "subscribe", label: "Subscribe" },
  { id: "appschedule", label: "Schedule" },
  { id: "myclasses", label: "My Classes" },
];

function TrialPanel() {
  const { subscribed, trialBooking, allClasses, submitTrial, setActiveTab, primaryPlan } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState("");

  if (subscribed) {
    return (
      <div className="sub-gate-box">
        <h4>You&apos;re already subscribed</h4>
        <p>Your membership includes unlimited live classes. Head to the schedule to book your next session.</p>
        <button className="sub-btn" type="button" onClick={() => setActiveTab("appschedule")}>
          View schedule →
        </button>
      </div>
    );
  }

  if (trialBooking) {
    const c = allClasses.find((x) => x.id === trialBooking.classId);
    return (
      <>
        <div className="trial-success">
          <h4>✓ Trial lesson booked</h4>
          <p>
            Hi {trialBooking.name}, you&apos;re all set. We&apos;ll send joining details to{" "}
            <strong>{trialBooking.email}</strong> before your class.
          </p>
          {c && (
            <div className="trial-class-pill">
              {c.type} · {c.day} · {c.time}
            </div>
          )}
        </div>
        <div className="sub-gate-box">
          <h4>Love your first class?</h4>
          <p>Subscribe for unlimited daily access — Yin, Vinyasa, Pilates, and more with Fillie Faragi.</p>
          <button className="sub-btn" type="button" onClick={() => setActiveTab("subscribe")}>
            View membership · {primaryPlan ? formatPlanPeriod(primaryPlan) : "$70/mo"}
          </button>
        </div>
      </>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = parseInt(classId, 10);
    if (!name.trim() || !email.trim() || !id) return;
    submitTrial({ name: name.trim(), email: email.trim(), classId: id });
  };

  return (
    <div className="sub-gate-box">
      <h4>Book your free trial lesson</h4>
      <p>Try one live class with Fillie Faragi — no payment required. One free session per person.</p>
      <form className="trial-form" onSubmit={handleSubmit}>
        <div className="trial-field">
          <label htmlFor="trial-name">Your name</label>
          <input id="trial-name" type="text" required placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="trial-field">
          <label htmlFor="trial-email">Email</label>
          <input id="trial-email" type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="trial-field">
          <label htmlFor="trial-class">Choose a class</label>
          <select id="trial-class" required value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select a class</option>
            {allClasses
              .filter((c) => !c.special)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.day} · {c.time} · {c.type}
                </option>
              ))}
          </select>
        </div>
        <button className="sub-btn" type="submit">Book my free trial</button>
        <p className="trial-note">We&apos;ll email you a link to join before your class starts.</p>
      </form>
    </div>
  );
}

function SubscribePanel() {
  const { subscribed, subscribe, cancelSub, setActiveTab, primaryPlan } = useApp();
  const priceLabel = primaryPlan ? formatPlanPeriod(primaryPlan) : "$70/mo";
  const subscribeLabel = primaryPlan?.subscribeCtaText ?? "Subscribe for $70/month";
  const priceAmount = primaryPlan?.price ?? 70;
  const priceCurrency = primaryPlan?.currency ?? "$";
  const pricePeriod = primaryPlan?.period ?? "mo";
  const planName = primaryPlan?.name ?? "Om At Home Monthly";

  if (subscribed) {
    return (
      <>
        <div className="sub-active-bar">
          <span>✓ Active — {planName} · {priceLabel}</span>
          <button className="cancel-btn" type="button" onClick={cancelSub}>Cancel</button>
        </div>
        <div className="sub-gate-box">
          <h4>Your daily access</h4>
          <p>Live classes daily with Fillie Faragi, shared with the global community</p>
          <div className="incl-grid">
            <div className="incl-item"><div className="incl-dot" style={{ background: "#8E44AD" }} /><div className="incl-name">Yin Yoga Flow</div><div className="incl-cnt">2pm &amp; 4pm</div></div>
            <div className="incl-item"><div className="incl-dot" style={{ background: "#2980B9" }} /><div className="incl-name">Vinyasa Flow</div><div className="incl-cnt">5:30am &amp; 9am</div></div>
            <div className="incl-item"><div className="incl-dot" style={{ background: "#27AE60" }} /><div className="incl-name">Pilates</div><div className="incl-cnt">11am</div></div>
            <div className="incl-item"><div className="incl-dot" style={{ background: "#C0392B" }} /><div className="incl-name">Heart Opening</div><div className="incl-cnt">Tue &amp; Thu</div></div>
            <div className="incl-item"><div className="incl-dot" style={{ background: "#D4A017" }} /><div className="incl-name">Sunset Flow</div><div className="incl-cnt">Quarterly</div></div>
          </div>
          <button className="sub-btn" type="button" onClick={() => setActiveTab("appschedule")}>
            View this week&apos;s schedule →
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="sub-gate-box">
      <h4>Join the global community</h4>
      <p>One subscription. Five daily classes. Practitioners in 40+ countries. Led by Fillie Faragi, live every day.</p>
      <div className="big-price">
        <sup>{priceCurrency}</sup>
        {priceAmount}
        <small>/{pricePeriod}</small>
      </div>
      <div className="incl-grid">
        <div className="incl-item"><div className="incl-dot" style={{ background: "#8E44AD" }} /><div className="incl-name">Yin Yoga Flow</div><div className="incl-cnt">2 per day</div></div>
        <div className="incl-item"><div className="incl-dot" style={{ background: "#2980B9" }} /><div className="incl-name">Vinyasa Flow</div><div className="incl-cnt">2 per day</div></div>
        <div className="incl-item"><div className="incl-dot" style={{ background: "#27AE60" }} /><div className="incl-name">Pilates</div><div className="incl-cnt">Daily</div></div>
      </div>
      <button className="sub-btn" type="button" onClick={subscribe}>
        {subscribeLabel}
      </button>
      <p style={{ fontSize: 11, color: "rgba(232,213,183,.3)", marginTop: ".75rem" }}>
        {primaryPlan?.note ?? "Cancel any time · No commitment"}
      </p>
    </div>
  );
}

function AppSchedulePanel() {
  const { allClasses, offers, subscribed, booked, trialBooking, appFilter, setAppFilter, toggleBook, setActiveTab } = useApp();

  const types = ["all", "Yin Yoga Flow", "Vinyasa Flow", "Pilates", "Heart Opening Yin"];
  const labels = ["All", "Yin", "Vinyasa", "Pilates", "Heart Yin"];
  const filtered = appFilter === "all" ? allClasses : allClasses.filter((c) => c.type === appFilter);

  return (
    <>
      <div className="sched-filter">
        {types.map((t, i) => (
          <button
            key={t}
            type="button"
            className={`sf-chip${appFilter === t ? " active" : ""}`}
            onClick={() => setAppFilter(t)}
          >
            {labels[i]}
          </button>
        ))}
      </div>
      {DAYS.map((day) => {
        const dc = filtered.filter((c) => c.day === day);
        if (!dc.length) return null;
        return (
          <div key={day} className="day-sec">
            <div className="day-lbl">{day}</div>
            {dc.map((c) => {
              const isB = booked.has(c.id);
              const locked = !subscribed;
              return (
                <div
                  key={c.id}
                  className={`sc-card${isB ? " is-booked" : ""}${locked ? " is-locked" : ""}${c.special ? " is-special" : ""}`}
                >
                  <div className="sc-badge" style={{ background: c.bg, color: c.color }}>
                    <ClassIcon type={c.type} color={c.color} offers={offers} />
                  </div>
                  <div className="sc-info">
                    <div className="sc-name">{c.type}</div>
                    <div className="sc-meta">{c.time} · {c.duration} · Fillie Faragi</div>
                  </div>
                  <div className="sc-right">
                    <div className="sc-spots">{c.special ? "Global event" : `${c.spots} spots`}</div>
                    <button
                      className={`bk-btn${isB ? " booked" : ""}`}
                      type="button"
                      onClick={() => toggleBook(c.id)}
                      disabled={isB}
                    >
                      {isB ? "✓ Booked" : c.special ? "Notify" : "Book"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {!subscribed && (
        <div className="app-empty">
          🌍 {trialBooking ? "Subscribe for unlimited classes" : "Book a free trial or subscribe to reserve your spot"}
          <br /><br />
          <button
            className="sub-btn"
            type="button"
            style={{ maxWidth: 200, margin: ".5rem auto 0" }}
            onClick={() => setActiveTab(trialBooking ? "subscribe" : "trial")}
          >
            {trialBooking ? "View plans" : "Book free trial"}
          </button>
        </div>
      )}
    </>
  );
}

function MyClassesPanel() {
  const { subscribed, trialBooking, allClasses, offers, booked, toggleBook, setActiveTab } = useApp();

  if (!subscribed && !trialBooking) {
    return (
      <div className="app-empty">
        Book a free trial lesson or subscribe for full access.
        <br /><br />
        <button className="sub-btn" type="button" style={{ maxWidth: 200, margin: ".5rem auto 0" }} onClick={() => setActiveTab("trial")}>
          Book free trial
        </button>
      </div>
    );
  }

  if (!subscribed && trialBooking) {
    const c = allClasses.find((x) => x.id === trialBooking.classId);
    if (!c) return <div className="app-empty">Your trial class could not be found.</div>;
    return (
      <>
        <div className="sub-active-bar">
          <span>Free trial · 1 class remaining</span>
          <button className="cancel-btn" type="button" onClick={() => setActiveTab("subscribe")}>Upgrade</button>
        </div>
        <div className="my-sc-card">
          <div className="sc-badge" style={{ background: c.bg, color: c.color }}>
            <ClassIcon type={c.type} color={c.color} offers={offers} />
          </div>
          <div className="sc-info">
            <div className="sc-name">{c.type}</div>
            <div className="sc-meta">{c.day} · {c.time} · {c.duration}</div>
          </div>
        </div>
        <button className="sub-btn" type="button" style={{ marginTop: "1rem" }} onClick={() => setActiveTab("subscribe")}>
          Subscribe for unlimited classes →
        </button>
      </>
    );
  }

  const myList = allClasses.filter((c) => booked.has(c.id));
  const cnt = {
    "Yin Yoga Flow": 0,
    "Vinyasa Flow": 0,
    Pilates: 0,
    "Heart Opening Yin": 0,
  };
  myList.forEach((c) => {
    if (c.type in cnt) cnt[c.type as keyof typeof cnt]++;
  });

  return (
    <>
      <div className="usage-wrap">
        <div className="usage-title">Bookings this week</div>
        <div className="usage-row">
          <span className="usage-lbl" style={{ color: "#8E44AD" }}>Yin Yoga</span>
          <div className="usage-track"><div className="usage-fill" style={{ width: `${Math.min((cnt["Yin Yoga Flow"] / 14) * 100, 100)}%`, background: "#8E44AD" }} /></div>
          <span className="usage-cnt">{cnt["Yin Yoga Flow"]}/14</span>
        </div>
        <div className="usage-row">
          <span className="usage-lbl" style={{ color: "#2980B9" }}>Vinyasa</span>
          <div className="usage-track"><div className="usage-fill" style={{ width: `${Math.min((cnt["Vinyasa Flow"] / 14) * 100, 100)}%`, background: "#2980B9" }} /></div>
          <span className="usage-cnt">{cnt["Vinyasa Flow"]}/14</span>
        </div>
        <div className="usage-row">
          <span className="usage-lbl" style={{ color: "#27AE60" }}>Pilates</span>
          <div className="usage-track"><div className="usage-fill" style={{ width: `${Math.min((cnt.Pilates / 7) * 100, 100)}%`, background: "#27AE60" }} /></div>
          <span className="usage-cnt">{cnt.Pilates}/7</span>
        </div>
        <div className="usage-row">
          <span className="usage-lbl" style={{ color: "#C0392B" }}>Heart Yin</span>
          <div className="usage-track"><div className="usage-fill" style={{ width: `${Math.min((cnt["Heart Opening Yin"] / 2) * 100, 100)}%`, background: "#C0392B" }} /></div>
          <span className="usage-cnt">{cnt["Heart Opening Yin"]}/2</span>
        </div>
      </div>
      {!myList.length ? (
        <div className="app-empty">
          No classes booked yet.
          <br /><br />
          <button className="sub-btn" type="button" style={{ maxWidth: 200, margin: ".75rem auto 0" }} onClick={() => setActiveTab("appschedule")}>
            Browse schedule
          </button>
        </div>
      ) : (
        myList.map((c) => (
          <div key={c.id} className="my-sc-card">
            <div className="sc-badge" style={{ background: c.bg, color: c.color }}>
              <ClassIcon type={c.type} color={c.color} offers={offers} />
            </div>
            <div className="sc-info">
              <div className="sc-name">{c.type}</div>
              <div className="sc-meta">{c.day} · {c.time}</div>
            </div>
            <button className="cancel-btn" type="button" onClick={() => toggleBook(c.id)}>Cancel</button>
          </div>
        ))
      )}
    </>
  );
}

export default function BookApp() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <section id="book-app" className="app-section">
      <div className="container">
        <p className="section-label" style={{ textAlign: "center" }}>Reserve your spot</p>
        <h2 className="section-title" style={{ textAlign: "center" }}>Book your mat</h2>
        <div className="app-wrap">
          <div className="app-header">
            <h3><span>ॐ</span> Om At Home</h3>
            <p>Live virtual yoga · Global community</p>
            <div className="app-strip">
              {["r", "o", "y", "g", "b", "i", "v"].map((c) => (
                <div key={c} className="app-dot" style={{ background: `var(--chakra-${c})` }} />
              ))}
            </div>
          </div>
          <div className="app-tabs">
            {APP_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`app-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div id="trial" className={`app-panel${activeTab === "trial" ? " active" : ""}`}><TrialPanel /></div>
          <div id="subscribe" className={`app-panel${activeTab === "subscribe" ? " active" : ""}`}><SubscribePanel /></div>
          <div id="appschedule" className={`app-panel${activeTab === "appschedule" ? " active" : ""}`}><AppSchedulePanel /></div>
          <div id="myclasses" className={`app-panel${activeTab === "myclasses" ? " active" : ""}`}><MyClassesPanel /></div>
        </div>
      </div>
    </section>
  );
}
