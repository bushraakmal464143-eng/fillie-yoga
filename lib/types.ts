export type YogaClass = {
  id: number;
  day: string;
  special: boolean;
  type: string;
  bg: string;
  color: string;
  time: string;
  duration: string;
  spots: number;
  note?: string;
};

export type OfferSchedule = {
  duration: string;
  days: string[];
  times: string[];
};

export type ClassOffer = {
  id: string;
  key: string;
  icon: string;
  vb: string;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  tagBg: string;
  tagColor: string;
  tag: string;
  schedule?: OfferSchedule;
  special?: boolean;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  sectionLabel: string;
  sectionTitle: string;
  features: string[];
  ctaText: string;
  trialCtaText: string;
  subscribeCtaText: string;
  note: string;
  highlighted?: boolean;
};

export type ClassesStore = {
  offers: ClassOffer[];
  sessions: YogaClass[];
  pricing: PricingPlan[];
};

export type TrialBooking = {
  name: string;
  email: string;
  classId: number;
  bookedAt: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
};

export type StoredUser = User & {
  passwordHash: string;
};

export type AppTab = "trial" | "subscribe" | "appschedule" | "myclasses";

export type TypeIcon = {
  id: string;
  vb: string;
};
