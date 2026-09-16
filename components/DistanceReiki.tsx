"use client";

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

function requestMailto(subject: string) {
  const body = encodeURIComponent(
    `Hi Om At Home,\n\nI would like to book a Distance Reiki session.\n\nPreferred session: ${subject}\nPreferred date/time (your timezone):\nIntention for the session:\n\nThank you.`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

export default function DistanceReiki() {
  return (
    <section className="service-page service-page--reiki">
      <div className="container service-hero service-hero--rich">
        <p className="section-label">Wellness offering</p>
        <h1 className="service-title">Distance Reiki</h1>
        <p className="service-lead">Healing energy knows no distance.</p>
        <p className="service-hero-copy">
          A gentle energy-healing practice you can receive from wherever you are. Your practitioner
          holds a quiet, intentional space focused on relaxation, balance, and energetic well-being.
        </p>
        <div className="service-hero-actions">
          <a className="btn-primary" href="#reiki-plans">
            View sessions
          </a>
          <a className="btn-ghost" href={requestMailto("Distance Reiki — Session inquiry")}>
            Request a session
          </a>
        </div>
        <p className="service-worldwide">Available worldwide. 🌎</p>
      </div>

      <div className="container service-body">
        <div className="service-split">
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
          <aside className="service-highlight-card">
            <p className="service-highlight-label">Session vibe</p>
            <ul>
              <li>Soft · quiet · restorative</li>
              <li>No performance, no pressure</li>
              <li>Receive in your own space</li>
              <li>Intention-led energetic support</li>
            </ul>
          </aside>
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

        <div className="service-confirm">
          <p className="section-label">Confirmation email</p>
          <h2 className="service-section-title">What you&apos;ll receive after booking</h2>
          <p className="service-confirm-intro">
            Once your session is set, you&apos;ll get a warm confirmation like this:
          </p>
          <div className="service-confirm-card service-email-card">
            <div className="service-email-meta">
              <span>From: Om at Home</span>
              <span>Subject: Your Distance Reiki session is confirmed</span>
            </div>
            <p className="service-confirm-title">
              Your Distance Reiki session with Om at Home is confirmed. ✨
            </p>
            <p>Thank you for trusting us with your practice.</p>
            <p>
              You don&apos;t need to prepare anything complicated. When your session approaches,
              find a quiet and comfortable place where you can relax and allow yourself to receive.
            </p>
            <p>Your practitioner will hold the session with your intention in mind.</p>
            <p>
              After your session, you&apos;ll receive a follow-up message with any reflections or
              intuitive insights from the experience.
            </p>
            <p className="service-signoff">
              With love and light,
              <br />
              Om at Home 🌿
            </p>
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
          <p className="section-label">Also from Om at Home</p>
          <h2 className="service-section-title">Curious about intuitive guidance?</h2>
          <p>
            Explore <strong>Ask the Rods</strong> — live or recorded dowsing sessions with Fillie.
          </p>
          <Link href={ROUTES.dowsing} className="btn-ghost service-related-cta">
            Visit Ask the Rods
          </Link>
        </div>
      </div>
    </section>
  );
}
