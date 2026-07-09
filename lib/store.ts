import { isSupabaseConfigured } from "./supabase/env";
import type { ClassOffer, ClassesStore, PricingPlan, YogaClass } from "./types";

async function backend() {
  if (isSupabaseConfigured()) {
    return import("./supabase-store");
  }
  return import("./file-store");
}

export async function readClassesStore(): Promise<ClassesStore> {
  const store = await backend();
  return store.readClassesStore();
}

export async function getOffers(): Promise<ClassOffer[]> {
  const store = await backend();
  return store.getOffers();
}

export async function getSessions(): Promise<YogaClass[]> {
  const store = await backend();
  return store.getSessions();
}

export async function getPricing(): Promise<PricingPlan[]> {
  const store = await backend();
  return store.getPricing();
}

export async function addPricingPlan(plan: Omit<PricingPlan, "id">): Promise<PricingPlan> {
  const store = await backend();
  return store.addPricingPlan(plan);
}

export async function updatePricingPlan(
  id: string,
  updates: Omit<PricingPlan, "id">,
): Promise<PricingPlan | null> {
  const store = await backend();
  return store.updatePricingPlan(id, updates);
}

export async function deletePricingPlan(id: string): Promise<boolean> {
  const store = await backend();
  return store.deletePricingPlan(id);
}

export async function addOffer(
  offer: Omit<ClassOffer, "id" | "key"> & { key?: string },
): Promise<ClassOffer> {
  const store = await backend();
  return store.addOffer(offer);
}

export async function deleteOffer(id: string): Promise<boolean> {
  const store = await backend();
  return store.deleteOffer(id);
}

export async function updateOffer(
  id: string,
  updates: Omit<ClassOffer, "id" | "key"> & { key?: string },
): Promise<ClassOffer | null> {
  const store = await backend();
  return store.updateOffer(id, updates);
}

export async function addSession(session: Omit<YogaClass, "id">): Promise<YogaClass> {
  const store = await backend();
  return store.addSession(session);
}

export async function deleteSession(id: number): Promise<boolean> {
  const store = await backend();
  return store.deleteSession(id);
}

export async function updateSession(
  id: number,
  updates: Omit<YogaClass, "id">,
): Promise<YogaClass | null> {
  const store = await backend();
  return store.updateSession(id, updates);
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
