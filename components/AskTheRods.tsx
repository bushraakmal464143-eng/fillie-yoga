"use client";

import { CONTACT_EMAIL } from "@/lib/routes";

type Plan = {
  title: string;
  price: string;
  emoji: string;
  details: string[];
  blurb: string;
  mailtoSubject: string;
};

const PLANS: Plan[] = [
  {
    title: "Live Dowsing",
    price: "$20",
    emoji: "🎥",
    details: ["20 minutes", "Up to 5 questions", "Private live session"],
    blurb:
      "Join Fillie for a private live session and ask your questions in real time. Watch the rods move, ask follow-up questions, and enjoy a playful, intuitive experience together.",
    mailtoSubject: "Ask the Rods — Live Dowsing ($20)",
  },
  {
    title: "Recorded Dowsing",
    price: "$10",
    emoji: "✨",
    details: ["Up to 3 yes-or-no questions", "Digital recording", "No appointment necessary"],
    blurb:
      "Can't make a live session? Send up to 3 yes-or-no questions, and Fillie will record your dowsing session and send you the results digitally.",
    mailtoSubject: "Ask the Rods — Recorded Dowsing ($10)",
  },
];

function requestMailto(subject: string, recorded: boolean) {
  const body = encodeURIComponent(
    recorded
      ? `Hi Om At Home,\n\nI would like a Recorded Dowsing session.\n\nMy yes-or-no questions:\n1.\n2.\n3.\n\nThank you.`
      : `Hi Om At Home,\n\nI would like a Live Dowsing session ($20).\n\nPreferred date/time (your timezone):\nTopics on my mind:\n\nThank you.`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

export default function AskTheRods() {
  return (
    <section className="service-page service-page--dowsing">
      <div className="container service-hero">
        <p className="section-label">Intuitive offering</p>
        <h1 className="service-title">Ask the Rods</h1>
        <p className="service-lead">You bring the questions. The rods bring the mystery.</p>
      </div>

      <div className="container service-body">
        <div className="service-prose">
          <p>
            Curious about something? Send your yes-or-no questions to Om At Home and let the
            dowsing rods offer an intuitive perspective.
          </p>
          <p>Choose the experience that feels right for you:</p>
        </div>

        <div className="service-plans">
          {PLANS.map((plan) => (
            <article key={plan.title} className="service-plan-card">
              <p className="service-plan-emoji" aria-hidden="true">
                {plan.emoji}
              </p>
              <h2>
                {plan.title} — {plan.price}
              </h2>
              <ul className="service-plan-details">
                {plan.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{plan.blurb}</p>
              <a
                className="btn-primary service-cta"
                href={requestMailto(plan.mailtoSubject, plan.title.includes("Recorded"))}
              >
                Request this experience
              </a>
            </article>
          ))}
        </div>

        <div className="service-prose service-prose--wide">
          <p>
            Whether you&apos;re wondering about love, a decision, a new opportunity, travel, or
            simply something that&apos;s been on your mind, come with an open mind and a little
            curiosity.
          </p>
          <p>
            Sometimes the answer is yes. Sometimes it&apos;s no. And sometimes the most interesting
            part is what the question reveals.
          </p>
        </div>

        <aside className="service-note">
          <p>
            Dowsing is offered as a spiritual/intuitive and entertainment practice. It should not be
            used as a substitute for medical, legal, financial, or other professional advice.
          </p>
        </aside>
      </div>
    </section>
  );
}
