"use client";

import { useApp } from "@/components/providers/AppProvider";
import { formatPlanAmount, getPrimaryPlan } from "@/lib/pricing";
import type { PricingPlan } from "@/lib/types";

type PricingProps = {
  plans?: PricingPlan[];
};

export default function Pricing({ plans: plansProp }: PricingProps) {
  const { pricing, openTrial, subscribe, checkoutLoading, checkoutError } = useApp();
  const plans = plansProp?.length ? plansProp : pricing;
  const primary = getPrimaryPlan(plans);

  if (!primary) return null;

  const showGrid = plans.length > 1;

  return (
    <section id="pricing" className="pricing-bg">
      <div className="container">
        <p className="section-label">{primary.sectionLabel}</p>
        <h2 className="section-title">{primary.sectionTitle}</h2>
        <div className={showGrid ? "pricing-grid" : "pricing-single"}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card${plan.highlighted ? " pricing-card--featured" : ""}`}
            >
              <div className="price-num">
                <sup>{plan.currency}</sup>
                {plan.price}
              </div>
              <div className="price-period">{plan.name}</div>
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
                onClick={() => void subscribe(plan.id)}
              >
                {checkoutLoading ? "Redirecting to Stripe…" : plan.ctaText}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={openTrial}
                style={{ marginTop: "0.75rem" }}
              >
                {plan.trialCtaText}
              </button>
              <p className="price-note">{plan.note}</p>
            </div>
          ))}
        </div>
        {checkoutError && (
          <p className="pricing-footnote" style={{ color: "#c0392b" }}>
            {checkoutError}
          </p>
        )}
        {showGrid && (
          <p className="pricing-footnote">
            Featured plan: {primary.name} · {formatPlanAmount(primary)}/{primary.period}
          </p>
        )}
      </div>
    </section>
  );
}
