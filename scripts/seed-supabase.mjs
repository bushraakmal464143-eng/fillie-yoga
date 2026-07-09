/**
 * Seed Supabase from data/classes.json
 *
 * Usage:
 *   1. Run supabase/schema.sql in your Supabase SQL Editor
 *   2. Add env vars to .env (see .env.example)
 *   3. node scripts/seed-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function loadEnv() {
  try {
    const raw = await readFile(path.join(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env optional if vars are already in the environment
  }
}

await loadEnv();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in environment`);
  return value;
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function offerToRow(offer, index) {
  return {
    id: offer.id,
    key: offer.key,
    icon: offer.icon ?? "icon-yin",
    vb: offer.vb ?? "0 0 48 48",
    icon_bg: offer.iconBg,
    icon_color: offer.iconColor,
    title: offer.title,
    description: offer.desc,
    tag_bg: offer.tagBg,
    tag_color: offer.tagColor,
    tag: offer.tag,
    schedule: offer.schedule ?? null,
    special: Boolean(offer.special),
    sort_order: index,
  };
}

function sessionToRow(session) {
  return {
    id: session.id,
    day: session.day,
    class_type: session.type,
    time: session.time,
    duration: session.duration,
    bg: session.bg,
    color: session.color,
    spots: session.spots ?? 8,
    special: Boolean(session.special),
    note: session.note ?? null,
  };
}

function pricingToRow(plan, index) {
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    currency: plan.currency ?? "$",
    period: plan.period ?? "mo",
    section_label: plan.sectionLabel,
    section_title: plan.sectionTitle,
    features: plan.features ?? [],
    cta_text: plan.ctaText,
    trial_cta_text: plan.trialCtaText,
    subscribe_cta_text: plan.subscribeCtaText,
    note: plan.note ?? "",
    highlighted: Boolean(plan.highlighted),
    sort_order: index,
  };
}

async function upsert(table, rows, onConflict = "id") {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ✓ ${table}: ${rows.length} rows`);
}

async function main() {
  const raw = await readFile(path.join(root, "data", "classes.json"), "utf8");
  const store = JSON.parse(raw);

  console.log("Seeding Supabase…");

  await upsert(
    "class_offers",
    (store.offers ?? []).map(offerToRow),
  );
  await upsert(
    "yoga_sessions",
    (store.sessions ?? []).map(sessionToRow),
  );
  await upsert(
    "pricing_plans",
    (store.pricing ?? []).map(pricingToRow),
  );

  // Reset session id sequence after explicit id inserts
  const maxId = Math.max(0, ...(store.sessions ?? []).map((s) => s.id));
  if (maxId > 0) {
    const { error } = await supabase.rpc("exec_sql", {
      query: `SELECT setval(pg_get_serial_sequence('yoga_sessions', 'id'), ${maxId});`,
    });
    // rpc may not exist — sequence fix is optional; log if it fails silently
    if (error) {
      console.log("  (Run manually in SQL Editor if new sessions get duplicate ids:)");
      console.log(`  SELECT setval(pg_get_serial_sequence('yoga_sessions', 'id'), ${maxId});`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
