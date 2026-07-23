export function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const EMPTY_OFFER = {
  title: "",
  desc: "",
  duration: "45 min",
  days: [] as string[],
  times: ["09:00"],
  customTag: "",
  useCustomTag: false,
  icon: "icon-yin",
  vb: "0 0 48 48",
  iconBg: "#8e44ad1a",
  iconColor: "#7b3fa0",
  tagBg: "#8e44ad15",
  tagColor: "#7b3fa0",
  special: false,
};

export const EMPTY_SESSION = {
  day: "Monday",
  type: "",
  time: "",
  duration: "45 min",
  bg: "#2980B922",
  color: "#1E6FA8",
  spots: 8,
  special: false,
  note: "",
};

export const EMPTY_PRICING = {
  name: "",
  price: 70,
  currency: "$",
  period: "mo",
  sectionLabel: "Membership",
  sectionTitle: "One mat, unlimited access",
  featuresText: "",
  ctaText: "Join the global community",
  trialCtaText: "Or try a free class first",
  subscribeCtaText: "Subscribe for $70/month",
  note: "No contracts · Cancel any time",
  highlighted: true,
};

export type OfferFormState = typeof EMPTY_OFFER;
export type SessionFormState = typeof EMPTY_SESSION;
export type PricingFormState = typeof EMPTY_PRICING;

export function normalizeColor(color: string) {
  return color.length === 7 ? color : "#7b3fa0";
}

export function scrollToForm(id: string) {
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
