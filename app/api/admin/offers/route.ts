import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { addOffer, deleteOffer, getOffers, updateOffer } from "@/lib/store";
import type { ClassOffer } from "@/lib/types";

function offerPayload(body: Omit<ClassOffer, "id" | "key"> & { key?: string }) {
  return {
    icon: body.icon || "icon-yin",
    vb: body.vb || "0 0 48 48",
    iconBg: body.iconBg || "#8e44ad1a",
    iconColor: body.iconColor || "#7b3fa0",
    title: body.title.trim(),
    desc: body.desc.trim(),
    tagBg: body.tagBg || "#8e44ad15",
    tagColor: body.tagColor || "#7b3fa0",
    tag: body.tag.trim(),
    schedule: body.schedule,
    special: Boolean(body.special),
    key: body.key,
  };
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const offers = await getOffers();
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as Omit<ClassOffer, "id" | "key"> & {
    key?: string;
  };

  if (!body.title?.trim() || !body.desc?.trim() || !body.tag?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const offer = await addOffer(offerPayload(body));
  return NextResponse.json(offer, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as ClassOffer;

  if (!body.id || !body.title?.trim() || !body.desc?.trim() || !body.tag?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const offer = await updateOffer(body.id, offerPayload(body));
  if (!offer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(offer);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const removed = await deleteOffer(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
