"use client";

import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, ROUTES } from "@/lib/routes";

type Plan = {
  title: string;
  price: string;
  duration: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
  mailtoSubject: string;
};

const PLANS: Plan[] = [
  {
    title: "30-Minute Session",
    price: "$25",
    duration: "30 minutes",
    blurb: "A gentle energetic reset for relaxation, grounding, and balance.",
    features: [
      "Quiet, intentional energy session",
      "Receive from anywhere in the world",
      "Set your own intention",
      "Short follow-up reflections after",
    ],
    mailtoSubject: "Distance Reiki — 30-Minute Session ($25)",
  },
  {
    title: "60-Minute Session",
    price: "$40",
    duration: "60 minutes",
    blurb:
      "A deeper session allowing more time for relaxation, energetic work, and intuitive reflection.",
    features: [
      "Longer, deeper energetic support",
      "More space for relaxation and rest",
      "Intuitive reflections included",
      "Ideal if you want extra time to receive",
    ],
    highlighted: true,
    mailtoSubject: "Distance Reiki — 60-Minute Session ($40)",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Request your session",
    text: "Choose 30 or 60 minutes and share your preferred time plus a simple intention.",
  },
  {
    num: "02",
    title: "Rest and receive",
    text: "No Zoom needed. Find a quiet place, lie down or sit comfortably, and allow the session to unfold.",
  },
  {
    num: "03",
    title: "Get your follow-up",
    text: "Afterwards you’ll receive a short message with reflections and any intuitive insights that came through.",
  },
];

const BENEFITS = [
  {
    title: "Relaxation",
    text: "A calm space to soften the nervous system and settle into rest.",
  },
  {
    title: "Balance",
    text: "Gentle energetic support when life feels scattered or heavy.",
  },
  {
    title: "Grounding",
    text: "Come back to your body, breath, and present moment — from anywhere.",
  },
  {
    title: "Insight",
    text: "Receive reflections after the session to help integrate what arose.",
  },
];

const FAQS = [
  {
    q: "Do I need to be on a video call?",
    a: "No. Distance Reiki does not require Zoom or any special setup. Simply rest and receive.",
  },
  {
    q: "Where can I be during the session?",
    a: "Anywhere in the world. Choose a quiet, comfortable place where you feel safe to relax.",
  },
  {
    q: "How do I prepare?",
    a: "Nothing complicated. Drink some water, set an intention, and give yourself permission to rest.",
  },
  {
    q: "What happens after?",
    a: "You’ll receive a short follow-up message with reflections and any intuitive insights from the experience.",
  },
];

const MOOD_IMAGES = [
  {
    src: "/assets/images/reiki/reiki-rest.jpg",
    alt: "Soft spa still life with candle, rolled towel, and pink tulips",
  },
  {
    src: "/assets/images/reiki/reiki-light.jpg",
    alt: "Silhouette of a person meditating at sunrise in warm golden light",
  },
  {
    src: "/assets/images/reiki/reiki-nature.png",
    alt: "Soft misty forest light filtering through tall trees at dawn",
  },
] as const;

function requestMailto(subject: string) {
  const body = encodeURIComponent(
    `Hi Om At Home,\n\nI would like to book a Distance Reiki session.\n\nPreferred session: ${subject}\nPreferred date/time (your timezone):\nIntention for the session:\n\nThank you.`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

export default function DistanceReiki() {
  return (
    <section className="service-page service-page--reiki">
      <div className="container service-hero-layout">
        <div className="service-hero service-hero--rich">
          <p className="section-label">Wellness offering</p>
          <h1 className="service-title">Distance Reiki</h1>
          <p className="service-lead">Healing energy knows no distance.</p>
          <p className="service-hero-copy">
            A gentle energy-healing practice you can receive from wherever you are. Your
            practitioner holds a quiet, intentional space focused on relaxation, balance, and
            energetic well-being.
          </p>
          <div className="service-hero-actions">
            <a className="btn-primary" href="#reiki-plans">
              View sessions
            </a>
            <a className="btn-outline" href={requestMailto("Distance Reiki — Session inquiry")}>
              Request a session
            </a>
          </div>
          <p className="service-worldwide">Available worldwide. 🌎</p>
        </div>
        <figure className="service-hero-visual">
          <Image
            src="/assets/images/reiki/reiki-space.png"
            alt="Quiet corner with a meditation cushion, soft morning light, and a simple ceramic bowl"
            width={960}
            height={720}
            priority
            className="service-photo"
          />
        </figure>
      </div>

      <div className="container service-mood-strip" aria-hidden="true">
        {MOOD_IMAGES.map((image) => (
          <figure key={image.src} className="service-mood-frame">
            <Image
              src={image.src}
              alt=""
              width={640}
              height={480}
              className="service-photo"
            />
          </figure>
        ))}
      </div>

      <div className="container service-body">
        <div className="service-split service-split--visual">
          <div className="service-prose">
            <h2 className="service-section-title">What is Distance Reiki?</h2>
            <p>
              Distance Reiki is a gentle energy-healing practice that can be received from wherever
              you are in the world. During your session, your practitioner creates a quiet,
              intentional space focused on relaxation, balance, and energetic well-being.
            </p>
            <p>
              You don&apos;t need to be on a video call or do anything special during the session.
              Simply find a comfortable place to rest, set an intention for your session, and allow
              yourself to receive.
            </p>
            <p>
              After your session, you&apos;ll receive a short message with reflections from the
              experience and any intuitive insights that came through.
            </p>
          </div>
          <figure className="service-side-visual">
            <Image
              src="/assets/images/reiki/reiki-hands.png"
              alt="Open hands resting gently in soft golden light"
              width={720}
              height={960}
              className="service-photo"
            />
            <figcaption>
              Soft · quiet · restorative — receive in your own space, with no performance and no
              pressure.
            </figcaption>
          </figure>
        </div>

        <div className="service-steps-block">
          <p className="section-label">How it works</p>
          <h2 className="service-section-title">Three simple steps</h2>
          <div className="service-steps">
            {STEPS.map((step) => (
              <article key={step.num} className="service-step">
                <span className="service-step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        <figure className="service-visual-band">
          <Image
            src="/assets/images/reiki/reiki-nature.png"
            alt="Soft misty forest light filtering through tall trees at dawn"
            width={1600}
            height={900}
            className="service-photo"
          />
          <figcaption>Find a quiet place. Rest. Allow the session to unfold.</figcaption>
        </figure>

        <div className="service-benefits-block">
          <p className="section-label">Why people book</p>
          <h2 className="service-section-title">What you may receive</h2>
          <div className="service-benefits">
            {BENEFITS.map((item) => (
              <article key={item.title} className="service-benefit">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div id="reiki-plans" className="service-plans-block">
          <p className="section-label">Choose your session</p>
          <h2 className="service-section-title">Distance Reiki pricing</h2>
          <div className="service-plans">
            {PLANS.map((plan) => (
              <article
                key={plan.title}
                className={`service-plan-card${plan.highlighted ? " is-featured" : ""}`}
              >
                {plan.highlighted && <span className="service-plan-badge">Most chosen</span>}
                <h2>{plan.title}</h2>
                <p className="service-plan-price">
                  {plan.price}
                  <small> · {plan.duration}</small>
                </p>
                <p>{plan.blurb}</p>
                <ul className="service-plan-details">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a className="btn-primary service-cta" href={requestMailto(plan.mailtoSubject)}>
                  Request this session
                </a>
              </article>
            ))}
          </div>
        </div>

        <aside className="service-note">
          <p>
            Reiki is a complementary wellness practice and is not intended to diagnose, treat, or
            cure medical conditions.
          </p>
        </aside>

        <div className="service-after">
          <p className="section-label">After you book</p>
          <h2 className="service-section-title">A gentle path from request to rest</h2>
          <p className="service-after-lead">
            Once your session is set, everything arrives quietly — no rush, no performance, just
            space to receive.
          </p>
          <div className="service-after-grid">
            <article className="service-after-item">
              <span className="service-after-num" aria-hidden="true">
                01
              </span>
              <h3>Confirmation</h3>
              <p>
                You&apos;ll receive a warm note confirming your session time, so you can settle in
                with ease.
              </p>
            </article>
            <article className="service-after-item">
              <span className="service-after-num" aria-hidden="true">
                02
              </span>
              <h3>Prepare simply</h3>
              <p>
                Find a quiet, comfortable place. Rest, set an intention, and allow yourself to
                receive — nothing complicated required.
              </p>
            </article>
            <article className="service-after-item">
              <span className="service-after-num" aria-hidden="true">
                03
              </span>
              <h3>Follow-up care</h3>
              <p>
                Afterward, a short message arrives with reflections and any intuitive insights from
                the experience.
              </p>
            </article>
          </div>
        </div>

        <div className="service-faq-block">
          <p className="section-label">FAQ</p>
          <h2 className="service-section-title">Common questions</h2>
          <div className="service-faq-list">
            {FAQS.map((item) => (
              <details key={item.q} className="service-faq">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="service-related">
          <div className="service-related-card">
            <div className="service-related-copy">
              <p className="section-label">Also from Om At Home</p>
              <h2 className="service-section-title">Curious about intuitive guidance?</h2>
              <p>
                Explore <strong>Ask the Rods</strong> — live or recorded dowsing sessions with
                Fillie.
              </p>
              <Link href={ROUTES.dowsing} className="btn-primary service-related-cta">
                Visit Ask the Rods
              </Link>
            </div>
            <figure className="service-related-visual">
              <Image
                src="/assets/images/dowsing/dowsing-rods.png"
                alt="Antique brass dowsing rods resting on soft linen"
                width={640}
                height={480}
                className="service-photo"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
