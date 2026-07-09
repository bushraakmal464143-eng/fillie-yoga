import { promises as fs } from "fs";
import path from "path";
import { getDefaultStore } from "./default-store";
import type { ClassOffer, ClassesStore, PricingPlan, YogaClass } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "classes.json");

function normalizeStore(parsed: Partial<ClassesStore>): ClassesStore {
  const defaults = getDefaultStore();
  return {
    offers: parsed.offers ?? defaults.offers,
    sessions: parsed.sessions ?? defaults.sessions,
    pricing: parsed.pricing?.length ? parsed.pricing : defaults.pricing,
  };
}

async function ensureStore(): Promise<ClassesStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<ClassesStore>;
    const store = normalizeStore(parsed);
    if (!parsed.pricing?.length) {
      await writeStore(store);
    }
    return store;
  } catch {
    const store = getDefaultStore();
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
    return store;
  }
}

async function writeStore(store: ClassesStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function readClassesStore(): Promise<ClassesStore> {
  return ensureStore();
}

export async function getOffers(): Promise<ClassOffer[]> {
  const store = await ensureStore();
  return store.offers;
}

export async function getSessions(): Promise<YogaClass[]> {
  const store = await ensureStore();
  return store.sessions;
}

export async function getPricing(): Promise<PricingPlan[]> {
  const store = await ensureStore();
  return store.pricing;
}

export async function addPricingPlan(
  plan: Omit<PricingPlan, "id">,
): Promise<PricingPlan> {
  const store = await ensureStore();
  const newPlan: PricingPlan = {
    ...plan,
    id: `plan-${crypto.randomUUID()}`,
    name: plan.name.trim(),
    sectionLabel: plan.sectionLabel.trim(),
    sectionTitle: plan.sectionTitle.trim(),
    features: plan.features.map((feature) => feature.trim()).filter(Boolean),
    ctaText: plan.ctaText.trim(),
    trialCtaText: plan.trialCtaText.trim(),
    subscribeCtaText: plan.subscribeCtaText.trim(),
    note: plan.note.trim(),
  };
  store.pricing.push(newPlan);
  await writeStore(store);
  return newPlan;
}

export async function updatePricingPlan(
  id: string,
  updates: Omit<PricingPlan, "id">,
): Promise<PricingPlan | null> {
  const store = await ensureStore();
  const index = store.pricing.findIndex((plan) => plan.id === id);
  if (index === -1) return null;

  const updated: PricingPlan = {
    ...store.pricing[index],
    ...updates,
    id,
    name: updates.name.trim(),
    sectionLabel: updates.sectionLabel.trim(),
    sectionTitle: updates.sectionTitle.trim(),
    features: updates.features.map((feature) => feature.trim()).filter(Boolean),
    ctaText: updates.ctaText.trim(),
    trialCtaText: updates.trialCtaText.trim(),
    subscribeCtaText: updates.subscribeCtaText.trim(),
    note: updates.note.trim(),
  };

  store.pricing[index] = updated;
  await writeStore(store);
  return updated;
}

export async function deletePricingPlan(id: string): Promise<boolean> {
  const store = await ensureStore();
  if (store.pricing.length <= 1) return false;
  const before = store.pricing.length;
  store.pricing = store.pricing.filter((plan) => plan.id !== id);
  if (store.pricing.length === before) return false;
  await writeStore(store);
  return true;
}

export async function addOffer(
  offer: Omit<ClassOffer, "id" | "key"> & { key?: string },
): Promise<ClassOffer> {
  const store = await ensureStore();
  const key =
    offer.key ??
    offer.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const newOffer: ClassOffer = {
    ...offer,
    id: `offer-${crypto.randomUUID()}`,
    key,
    schedule: offer.schedule,
  };
  store.offers.push(newOffer);
  await writeStore(store);
  return newOffer;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const store = await ensureStore();
  const before = store.offers.length;
  store.offers = store.offers.filter((offer) => offer.id !== id);
  if (store.offers.length === before) return false;
  await writeStore(store);
  return true;
}

export async function updateOffer(
  id: string,
  updates: Omit<ClassOffer, "id" | "key"> & { key?: string },
): Promise<ClassOffer | null> {
  const store = await ensureStore();
  const index = store.offers.findIndex((offer) => offer.id === id);
  if (index === -1) return null;

  const existing = store.offers[index];
  const key =
    updates.key ??
    (updates.title !== existing.title
      ? slugifyTitle(updates.title)
      : existing.key);

  const updated: ClassOffer = {
    ...existing,
    ...updates,
    id,
    key,
    title: updates.title.trim(),
    desc: updates.desc.trim(),
    tag: updates.tag.trim(),
    schedule: updates.schedule,
  };

  store.offers[index] = updated;
  await writeStore(store);
  return updated;
}

export async function addSession(
  session: Omit<YogaClass, "id">,
): Promise<YogaClass> {
  const store = await ensureStore();
  const nextId = store.sessions.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const newSession: YogaClass = { ...session, id: nextId };
  store.sessions.push(newSession);
  await writeStore(store);
  return newSession;
}

export async function deleteSession(id: number): Promise<boolean> {
  const store = await ensureStore();
  const before = store.sessions.length;
  store.sessions = store.sessions.filter((session) => session.id !== id);
  if (store.sessions.length === before) return false;
  await writeStore(store);
  return true;
}

export async function updateSession(
  id: number,
  updates: Omit<YogaClass, "id">,
): Promise<YogaClass | null> {
  const store = await ensureStore();
  const index = store.sessions.findIndex((session) => session.id === id);
  if (index === -1) return null;

  const updated: YogaClass = {
    ...store.sessions[index],
    ...updates,
    id,
    type: updates.type.trim(),
    time: updates.time.trim(),
    duration: updates.duration.trim(),
    note: updates.note?.trim() || undefined,
  };

  store.sessions[index] = updated;
  await writeStore(store);
  return updated;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
