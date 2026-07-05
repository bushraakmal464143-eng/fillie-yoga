import type { PricingPlan } from "./types";

export function getPrimaryPlan(plans: PricingPlan[]): PricingPlan | null {
  if (!plans.length) return null;
  return plans.find((plan) => plan.highlighted) ?? plans[0];
}

export function formatPlanAmount(plan: PricingPlan): string {
  return `${plan.currency}${plan.price}`;
}

export function formatPlanPeriod(plan: PricingPlan): string {
  return `${formatPlanAmount(plan)}/${plan.period}`;
}

export function featuresToText(features: string[]): string {
  return features.join("\n");
}

export function textToFeatures(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
