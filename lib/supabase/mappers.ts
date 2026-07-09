import type { ClassOffer, OfferSchedule, PricingPlan, YogaClass } from "@/lib/types";

type OfferRow = {
  id: string;
  key: string;
  icon: string;
  vb: string;
  icon_bg: string;
  icon_color: string;
  title: string;
  description: string;
  tag_bg: string;
  tag_color: string;
  tag: string;
  schedule: OfferSchedule | null;
  special: boolean;
  sort_order: number;
};

type SessionRow = {
  id: number;
  day: string;
  class_type: string;
  time: string;
  duration: string;
  bg: string;
  color: string;
  spots: number;
  special: boolean;
  note: string | null;
};

type PricingRow = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  section_label: string;
  section_title: string;
  features: string[];
  cta_text: string;
  trial_cta_text: string;
  subscribe_cta_text: string;
  note: string;
  highlighted: boolean;
  sort_order: number;
};

export function offerFromRow(row: OfferRow): ClassOffer {
  return {
    id: row.id,
    key: row.key,
    icon: row.icon,
    vb: row.vb,
    iconBg: row.icon_bg,
    iconColor: row.icon_color,
    title: row.title,
    desc: row.description,
    tagBg: row.tag_bg,
    tagColor: row.tag_color,
    tag: row.tag,
    schedule: row.schedule ?? undefined,
    special: row.special || undefined,
  };
}

export function offerToRow(
  offer: Omit<ClassOffer, "id"> & { id?: string; key: string },
  sortOrder = 0,
): Omit<OfferRow, "id"> & { id?: string } {
  return {
    id: offer.id,
    key: offer.key,
    icon: offer.icon,
    vb: offer.vb,
    icon_bg: offer.iconBg,
    icon_color: offer.iconColor,
    title: offer.title,
    description: offer.desc,
    tag_bg: offer.tagBg,
    tag_color: offer.tagColor,
    tag: offer.tag,
    schedule: offer.schedule ?? null,
    special: Boolean(offer.special),
    sort_order: sortOrder,
  };
}

export function sessionFromRow(row: SessionRow): YogaClass {
  return {
    id: row.id,
    day: row.day,
    type: row.class_type,
    time: row.time,
    duration: row.duration,
    bg: row.bg,
    color: row.color,
    spots: row.spots,
    special: row.special,
    note: row.note ?? undefined,
  };
}

export function sessionToRow(session: Omit<YogaClass, "id">) {
  return {
    day: session.day,
    class_type: session.type,
    time: session.time,
    duration: session.duration,
    bg: session.bg,
    color: session.color,
    spots: session.spots,
    special: Boolean(session.special),
    note: session.note ?? null,
  };
}

export function pricingFromRow(row: PricingRow): PricingPlan {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    currency: row.currency,
    period: row.period,
    sectionLabel: row.section_label,
    sectionTitle: row.section_title,
    features: row.features,
    ctaText: row.cta_text,
    trialCtaText: row.trial_cta_text,
    subscribeCtaText: row.subscribe_cta_text,
    note: row.note,
    highlighted: row.highlighted || undefined,
  };
}

export function pricingToRow(
  plan: Omit<PricingPlan, "id"> & { id?: string },
  sortOrder = 0,
) {
  return {
    id: plan.id,
    name: plan.name.trim(),
    price: plan.price,
    currency: plan.currency,
    period: plan.period,
    section_label: plan.sectionLabel.trim(),
    section_title: plan.sectionTitle.trim(),
    features: plan.features.map((f) => f.trim()).filter(Boolean),
    cta_text: plan.ctaText.trim(),
    trial_cta_text: plan.trialCtaText.trim(),
    subscribe_cta_text: plan.subscribeCtaText.trim(),
    note: plan.note.trim(),
    highlighted: Boolean(plan.highlighted),
    sort_order: sortOrder,
  };
}
