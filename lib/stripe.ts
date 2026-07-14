import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function toStripeCurrency(symbolOrCode: string): string {
  const value = symbolOrCode.trim().toLowerCase();
  if (value === "$" || value === "usd") return "usd";
  if (value === "€" || value === "eur") return "eur";
  if (value === "£" || value === "gbp") return "gbp";
  if (value.length === 3) return value;
  return "usd";
}

export function toRecurringInterval(
  period: string,
): Stripe.PriceCreateParams.Recurring.Interval {
  const value = period.trim().toLowerCase();
  if (value.startsWith("y") || value.includes("year") || value === "yr") {
    return "year";
  }
  if (value.startsWith("w") || value.includes("week")) {
    return "week";
  }
  return "month";
}
