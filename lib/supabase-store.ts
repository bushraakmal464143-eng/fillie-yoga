import { createAdminClient } from "./supabase/admin";
import {
  offerFromRow,
  offerToRow,
  pricingFromRow,
  pricingToRow,
  sessionFromRow,
  sessionToRow,
} from "./supabase/mappers";
import type { ClassOffer, ClassesStore, PricingPlan, YogaClass } from "./types";

function db() {
  return createAdminClient();
}

export async function readClassesStore(): Promise<ClassesStore> {
  const [offers, sessions, pricing] = await Promise.all([
    getOffers(),
    getSessions(),
    getPricing(),
  ]);
  return { offers, sessions, pricing };
}

export async function getOffers(): Promise<ClassOffer[]> {
  const { data, error } = await db()
    .from("class_offers")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(offerFromRow);
}

export async function getSessions(): Promise<YogaClass[]> {
  const { data, error } = await db()
    .from("yoga_sessions")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(sessionFromRow);
}

export async function getPricing(): Promise<PricingPlan[]> {
  const { data, error } = await db()
    .from("pricing_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(pricingFromRow);
}

export async function addPricingPlan(
  plan: Omit<PricingPlan, "id">,
): Promise<PricingPlan> {
  const id = `plan-${crypto.randomUUID()}`;
  const row = pricingToRow({ ...plan, id });
  const { data, error } = await db().from("pricing_plans").insert(row).select().single();
  if (error) throw error;
  return pricingFromRow(data);
}

export async function updatePricingPlan(
  id: string,
  updates: Omit<PricingPlan, "id">,
): Promise<PricingPlan | null> {
  const row = pricingToRow({ ...updates, id });
  const { data, error } = await db()
    .from("pricing_plans")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return pricingFromRow(data);
}

export async function deletePricingPlan(id: string): Promise<boolean> {
  const plans = await getPricing();
  if (plans.length <= 1) return false;

  const { error, count } = await db()
    .from("pricing_plans")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function addOffer(
  offer: Omit<ClassOffer, "id" | "key"> & { key?: string },
): Promise<ClassOffer> {
  const key =
    offer.key ??
    offer.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const id = `offer-${crypto.randomUUID()}`;
  const row = offerToRow({ ...offer, id, key });
  const { data, error } = await db().from("class_offers").insert(row).select().single();
  if (error) throw error;
  return offerFromRow(data);
}

export async function deleteOffer(id: string): Promise<boolean> {
  const { error, count } = await db()
    .from("class_offers")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function updateOffer(
  id: string,
  updates: Omit<ClassOffer, "id" | "key"> & { key?: string },
): Promise<ClassOffer | null> {
  const existing = (await getOffers()).find((o) => o.id === id);
  if (!existing) return null;

  const key =
    updates.key ??
    (updates.title !== existing.title ? slugifyTitle(updates.title) : existing.key);

  const row = offerToRow(
    {
      ...existing,
      ...updates,
      id,
      key,
      title: updates.title.trim(),
      desc: updates.desc.trim(),
      tag: updates.tag.trim(),
    },
    0,
  );

  const { data, error } = await db()
    .from("class_offers")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return offerFromRow(data);
}

export async function addSession(
  session: Omit<YogaClass, "id">,
): Promise<YogaClass> {
  const row = sessionToRow({
    ...session,
    type: session.type.trim(),
    time: session.time.trim(),
    duration: session.duration.trim(),
    note: session.note?.trim() || undefined,
  });

  const { data, error } = await db().from("yoga_sessions").insert(row).select().single();
  if (error) throw error;
  return sessionFromRow(data);
}

export async function deleteSession(id: number): Promise<boolean> {
  const { error, count } = await db()
    .from("yoga_sessions")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function updateSession(
  id: number,
  updates: Omit<YogaClass, "id">,
): Promise<YogaClass | null> {
  const row = sessionToRow({
    ...updates,
    type: updates.type.trim(),
    time: updates.time.trim(),
    duration: updates.duration.trim(),
    note: updates.note?.trim() || undefined,
  });

  const { data, error } = await db()
    .from("yoga_sessions")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return sessionFromRow(data);
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
