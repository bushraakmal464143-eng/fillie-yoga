"use client";

import Link from "next/link";
import { useBookTrial } from "@/components/hooks/useBookTrial";
import { useApp } from "@/components/providers/AppProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { markPendingSubscribe } from "@/components/hooks/useJoinClass";
import { formatPlanAmount, formatPlanPeriod, getPrimaryPlan } from "@/lib/pricing";
import { ROUTES } from "@/lib/routes";
import type { PricingPlan } from "@/lib/types";

type PricingProps = {
  plans?: PricingPlan[];
};

const MEMBERSHIP_INCLUDES = [
  { name: "Yin Yoga Flow", detail: "2 classes daily", price: "Included" },
  { name: "Vinyasa Flow", detail: "2 classes daily", price: "Included" },
  { name: "Pilates", detail: "1 class daily", price: "Included" },
  { name: "Heart Opening Yin", detail: "Tue & Thu", price: "Included" },
  { name: "Sunset Flow from Giza", detail: "Quarterly live event", price: "Included" },
] as const;

const EXTRA_OFFERINGS = [
  {
    name: "Distance Reiki · 30 min",
    detail: "Gentle energetic reset",
    price: "$25",
    href: ROUTES.reiki,
  },
  {
    name: "Distance Reiki · 60 min",
    detail: "Deeper restorative session",
    price: "$40",
    href: ROUTES.reiki,
  },
  {
    name: "Ask the Rods · Live",
    detail: "20 min · up to 5 questions",
    price: "$20",
    href: ROUTES.dowsing,
  },
  {
    name: "Ask the Rods · Recorded",
    detail: "Up to 3 yes-or-no questions",
    price: "$10",
    href: ROUTES.dowsing,
  },
] as const;

export default function Pricing({ plans: plansProp }: PricingProps) {
  const { pricing, subscribe, checkoutLoading, checkoutError } = useApp();
  const { user, authReady, openAuth } = useAuth();
  const bookTrial = useBookTrial();
  const plans = plansProp?.length ? plansProp : pricing;
  const primary = getPrimaryPlan(plans);

  if (!primary) return null;

  const showGrid = plans.length > 1;

  const requireAuthThen = (action: () => void) => {
    if (!authReady) return;
    if (!user) {
      markPendingSubscribe();
      openAuth("login");
      return;
    }
    action();
  };

  return (
    <section id="pricing" className="pricing-bg">
      <div className="container">
        <p className="section-label">{primary.sectionLabel}</p>
        <h2 className="section-title">{primary.sectionTitle}</h2>
        <p className="pricing-intro">
          One membership for all live classes — plus optional wellness sessions priced separately.
        </p>

        <div className={showGrid ? "pricing-grid" : "pricing-single"}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card${plan.highlighted ? " pricing-card--featured" : ""}`}
            >
              <p className="price-total-label">Total subscription</p>
              <div className="price-num">
                <sup>{plan.currency}</sup>
                {plan.price}
                <small>/{plan.period}</small>
              </div>
              <div className="price-period">{plan.name}</div>
              <p className="price-total-line">
                Billed {formatPlanPeriod(plan)} · cancel any time
              </p>
              <div className="price-divider" />
              <ul className="price-includes">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                className="sub-btn"
                type="button"
                disabled={checkoutLoading}
                onClick={() => requireAuthThen(() => void subscribe(plan.id))}
              >
                {checkoutLoading
                  ? "Redirecting to Stripe…"
                  : plan.subscribeCtaText || `Subscribe for ${formatPlanAmount(plan)}/${plan.period}`}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => bookTrial()}
                style={{ marginTop: "0.75rem" }}
              >
                {plan.trialCtaText}
              </button>
              <p className="price-note">{plan.note}</p>
            </div>
          ))}
        </div>

        {checkoutError && (
          <p className="pricing-footnote" style={{ color: "#e8a0a0" }}>
            {checkoutError}
          </p>
        )}

        <div className="pricing-board">
          <div className="pricing-board-head">
            <p className="section-label">Full price list</p>
            <h3 className="pricing-board-title">Everything &amp; what it costs</h3>
          </div>

          <div className="pricing-board-block">
            <div className="pricing-board-block-head">
              <h4>Membership includes</h4>
              <span className="pricing-board-total">
                Total {formatPlanPeriod(primary)}
              </span>
            </div>
            <ul className="pricing-board-list">
              {MEMBERSHIP_INCLUDES.map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <em>{item.price}</em>
                </li>
              ))}
            </ul>
          </div>

          <div className="pricing-board-block">
            <div className="pricing-board-block-head">
              <h4>Wellness add-ons</h4>
              <span>Per session</span>
            </div>
            <ul className="pricing-board-list">
              {EXTRA_OFFERINGS.map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <Link href={item.href} className="pricing-board-price">
                    {item.price}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
