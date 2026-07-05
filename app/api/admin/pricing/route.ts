import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  addPricingPlan,
  deletePricingPlan,
  getPricing,
  updatePricingPlan,
} from "@/lib/store";
import type { PricingPlan } from "@/lib/types";

function pricingPayload(body: Omit<PricingPlan, "id">) {
  return {
    name: body.name,
    price: Number(body.price),
    currency: body.currency || "$",
    period: body.period || "mo",
    sectionLabel: body.sectionLabel,
    sectionTitle: body.sectionTitle,
    features: body.features ?? [],
    ctaText: body.ctaText,
    trialCtaText: body.trialCtaText,
    subscribeCtaText: body.subscribeCtaText,
    note: body.note,
    highlighted: Boolean(body.highlighted),
  };
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const pricing = await getPricing();
  return NextResponse.json(pricing);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as Omit<PricingPlan, "id">;

  if (!body.name?.trim() || !body.sectionTitle?.trim() || !body.features?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Number.isFinite(Number(body.price)) || Number(body.price) < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const plan = await addPricingPlan(pricingPayload(body));
  return NextResponse.json(plan, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as PricingPlan;

  if (!body.id || !body.name?.trim() || !body.sectionTitle?.trim() || !body.features?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Number.isFinite(Number(body.price)) || Number(body.price) < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const plan = await updatePricingPlan(body.id, pricingPayload(body));
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const removed = await deletePricingPlan(id);
  if (!removed) {
    return NextResponse.json(
      { error: "Not found or cannot delete the last pricing plan" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
