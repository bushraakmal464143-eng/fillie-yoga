"use client";

import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, ROUTES } from "@/lib/routes";

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

const MOOD_IMAGES = [
  {
    src: "/assets/images/dowsing/dowsing-still.png",
    alt: "Vintage compass, blank cards, and dried flowers on a warm wooden table",
  },
  {
    src: "/assets/images/dowsing/dowsing-hands.png",
    alt: "Hands holding thin metal dowsing rods in soft outdoor light",
  },
  {
    src: "/assets/images/dowsing/dowsing-path.png",
    alt: "Quiet countryside path in soft mist at golden hour",
  },
] as const;

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
      <div className="container service-hero-layout">
        <div className="service-hero service-hero--rich">
          <p className="section-label">Intuitive offering</p>
          <h1 className="service-title">Ask the Rods</h1>
          <p className="service-lead">You bring the questions. The rods bring the mystery.</p>
          <p className="service-hero-copy">
            Curious about something? Send your yes-or-no questions to Om At Home and let the
            dowsing rods offer an intuitive perspective — live with Fillie, or recorded at your
            own pace.
          </p>
          <div className="service-hero-actions">
            <a className="btn-primary" href="#dowsing-plans">
              View experiences
            </a>
            <a
              className="btn-outline"
              href={requestMailto("Ask the Rods — Session inquiry", false)}
            >
              Request a session
            </a>
          </div>
        </div>
        <figure className="service-hero-visual">
          <Image
            src="/assets/images/dowsing/dowsing-rods.png"
            alt="Antique brass dowsing rods resting on soft linen beside a candle"
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
            <Image src={image.src} alt="" width={640} height={480} className="service-photo" />
          </figure>
        ))}
      </div>

      <div className="container service-body">
        <div className="service-split service-split--visual">
          <div className="service-prose">
            <h2 className="service-section-title">What is dowsing?</h2>
            <p>
              Dowsing is a gentle intuitive practice. You bring a clear yes-or-no question, and
              Fillie works with the rods to offer a simple, curious perspective — never as
              medical, legal, or financial advice.
            </p>
            <p>
              Come with an open mind. Sometimes the answer is yes. Sometimes it&apos;s no. And
              sometimes the most interesting part is what the question reveals.
            </p>
            <p>Choose the experience that feels right for you below.</p>
          </div>
          <figure className="service-side-visual">
            <Image
              src="/assets/images/dowsing/dowsing-hands.png"
              alt="Hands holding metal dowsing rods outdoors in soft late-afternoon light"
              width={720}
              height={960}
              className="service-photo"
            />
            <figcaption>
              Playful · intuitive · lightly mysterious — bring your questions and a little
              curiosity.
            </figcaption>
          </figure>
        </div>

        <div id="dowsing-plans" className="service-plans-block">
          <p className="section-label">Choose your experience</p>
          <h2 className="service-section-title">Ask the Rods pricing</h2>
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
        </div>

        <figure className="service-visual-band">
          <Image
            src="/assets/images/dowsing/dowsing-path.png"
            alt="Quiet countryside path in soft mist at golden hour"
            width={1600}
            height={900}
            className="service-photo"
          />
          <figcaption>Wonder about love, a decision, travel — or whatever is on your mind.</figcaption>
        </figure>

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

        <div className="service-related">
          <p className="section-label">Also from Om at Home</p>
          <h2 className="service-section-title">Prefer a quiet energetic reset?</h2>
          <p>
            Explore <strong>Distance Reiki</strong> — gentle energy healing you can receive from
            anywhere in the world.
          </p>
          <Link href={ROUTES.reiki} className="btn-outline service-related-cta">
            Visit Distance Reiki
          </Link>
        </div>
      </div>
    </section>
  );
}
