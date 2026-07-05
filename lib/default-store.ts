import type { ClassOffer, ClassesStore, PricingPlan } from "./types";
import { buildClasses } from "./schedule";
import { parseOfferTag } from "./offer-schedule";

function withSchedule(offer: ClassOffer): ClassOffer {
  if (offer.schedule) return offer;
  const { schedule } = parseOfferTag(offer.tag);
  return { ...offer, schedule };
}

export const DEFAULT_OFFERS: ClassOffer[] = [
  {
    id: "offer-yin",
    key: "yin",
    icon: "icon-yin",
    vb: "0 0 48 48",
    iconBg: "#8e44ad1a",
    iconColor: "#7b3fa0",
    title: "Yin Yoga Flow",
    desc: "Long-held, grounding postures that release deep connective tissue and quiet the nervous system. A shared stillness with practitioners worldwide.",
    tagBg: "#8e44ad15",
    tagColor: "#7b3fa0",
    tag: "45 min · 2pm & 4pm daily",
  },
  {
    id: "offer-vinyasa",
    key: "vinyasa",
    icon: "icon-vinyasa",
    vb: "0 0 48 48",
    iconBg: "#2980b91a",
    iconColor: "#1e6fa8",
    title: "Vinyasa Flow",
    desc: "Breath-linked sequences that build strength and presence. Begin your morning moving in sync with yogis from Tokyo to Toronto.",
    tagBg: "#2980b915",
    tagColor: "#1e6fa8",
    tag: "45 min · 5:30am & 9am daily",
  },
  {
    id: "offer-pilates",
    key: "pilates",
    icon: "icon-pilates",
    vb: "0 0 48 48",
    iconBg: "#27ae601a",
    iconColor: "#1e7a4a",
    title: "Pilates",
    desc: "Core-focused movement that strengthens from the inside out. Low impact, high intention — a midday reset shared across time zones.",
    tagBg: "#27ae6015",
    tagColor: "#1e7a4a",
    tag: "35 min · 11am daily",
  },
  {
    id: "offer-heart",
    key: "heart",
    icon: "icon-heart-yin",
    vb: "0 0 48 48",
    iconBg: "#c0392b1a",
    iconColor: "#c0392b",
    title: "Heart Opening Yin",
    desc: "A special Yin practice focused on the heart chakra — chest, shoulders, and upper back. Offered twice a week to deepen your midweek practice.",
    tagBg: "#c0392b15",
    tagColor: "#c0392b",
    tag: "45 min · Tue & Thu 7am",
  },
  {
    id: "offer-sunset",
    key: "sunset-card",
    icon: "icon-sunset",
    vb: "0 0 24 24",
    iconBg: "#d4a01722",
    iconColor: "#a07010",
    title: "Sunset Flow: Live from Giza",
    desc: "A once-every-three-months live experience streaming Fillie's practice from the Giza Pyramids at sunset. Ancient energy, global community.",
    tagBg: "#d4a01722",
    tagColor: "#a07010",
    tag: "Once every 3 months · Live",
    special: true,
  },
];

export const DEFAULT_PRICING: PricingPlan[] = [
  {
    id: "plan-monthly",
    name: "Om At Home Monthly",
    price: 70,
    currency: "$",
    period: "mo",
    sectionLabel: "Membership",
    sectionTitle: "One mat, unlimited access",
    features: [
      "All five daily live classes",
      "Yin, Vinyasa, Pilates & Heart Opening Yin",
      "Book unlimited sessions each week",
      "Sunset Flow from Giza Pyramids (quarterly)",
      "Live sessions with Fillie Faragi",
    ],
    ctaText: "Join the global community",
    trialCtaText: "Or try a free class first",
    subscribeCtaText: "Subscribe for $70/month",
    note: "No contracts · Cancel any time",
    highlighted: true,
  },
];

export function getDefaultStore(): ClassesStore {
  return {
    offers: DEFAULT_OFFERS.map(withSchedule),
    sessions: buildClasses(),
    pricing: DEFAULT_PRICING,
  };
}
