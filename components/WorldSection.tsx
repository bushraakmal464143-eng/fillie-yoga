const WORLD_CITIES = [
  { color: "#1e6fa8", bg: "#2980b91a", city: "London", desc: "Early morning Vinyasa before the workday begins" },
  { color: "#c0392b", bg: "#c0392b1a", city: "Tokyo", desc: "Evening Yin Flow as the city lights come on" },
  { color: "#1e7a4a", bg: "#27ae601a", city: "Cape Town", desc: "Midmorning Pilates with an ocean backdrop" },
  { color: "#a07010", bg: "#d4a01722", city: "São Paulo", desc: "Sunset Flow connecting Brazil to Egypt in real time" },
  { color: "#7b3fa0", bg: "#8e44ad1a", city: "Mumbai", desc: "Heart Opening Yin to begin the midweek" },
  { color: "#2c3e50", bg: "#2c3e501a", city: "New York", desc: "Early-morning flow before the city wakes up" },
];

export default function WorldSection() {
  return (
    <section className="world-section">
      <div className="container">
        <p className="section-label reveal" style={{ "--reveal-delay": 0 } as React.CSSProperties}>
          Where we practice
        </p>
        <h2 className="section-title reveal" style={{ "--reveal-delay": 1 } as React.CSSProperties}>
          Your mat is the meeting place
        </h2>
        <p className="world-lead reveal" style={{ "--reveal-delay": 2 } as React.CSSProperties}>
          Whether you&apos;re in Lagos or London, Mumbai or Mexico City — you&apos;re
          never practicing alone.
        </p>
        <div className="world-grid">
          {WORLD_CITIES.map((w, index) => (
            <div
              key={w.city}
              className="world-card reveal"
              style={{ "--reveal-delay": index + 3 } as React.CSSProperties}
            >
              <div className="world-mark" style={{ background: w.bg, color: w.color }}>
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <use href="#icon-map-pin" />
                </svg>
              </div>
              <h4>{w.city}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
