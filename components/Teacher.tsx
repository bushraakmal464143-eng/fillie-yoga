import Image from "next/image";

export default function Teacher() {
  return (
    <section id="teacher" className="teacher-bg">
      <div className="container">
        <div className="teacher-layout">
          <div className="teacher-photo">
            <Image
              src="/assets/images/om-at-home-promo.png"
              alt="Fillie Faragi leading virtual yoga live from the Giza Pyramids"
              width={917}
              height={650}
              priority
            />
          </div>
          <div className="teacher-text">
            <p className="role">Lead Instructor &amp; Founder</p>
            <h2>Fillie Faragi</h2>
            <p>
              Fillie brings warmth, precision, and a deep love of connection to
              every class she leads. Her teaching weaves together the stillness of
              Yin, the energy of Vinyasa, the strength of Pilates — and a genuine
              belief that movement is better shared.
            </p>
            <p>
              From her mat to yours, across whatever distance lies between —
              Fillie shows up live, every day, for practitioners in every time
              zone. The Giza Pyramid sessions are her love letter to the global
              community she&apos;s built.
            </p>
            <p style={{ fontStyle: "italic", color: "var(--clay)", marginTop: "1.5rem" }}>
              &ldquo;When we breathe together, the world gets smaller.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
