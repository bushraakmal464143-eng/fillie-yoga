import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { addSession, deleteSession, getSessions, updateSession } from "@/lib/store";
import type { YogaClass } from "@/lib/types";
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const sessions = await getSessions();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as Omit<YogaClass, "id">;

  if (!body.day || !body.type?.trim() || !body.time?.trim() || !body.duration?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const session = await addSession({
    day: body.day,
    type: body.type.trim(),
    time: body.time.trim(),
    duration: body.duration.trim(),
    bg: body.bg || "#2980B922",
    color: body.color || "#1E6FA8",
    spots: Number(body.spots) || 8,
    special: Boolean(body.special),
    note: body.note?.trim() || undefined,
  });

  return NextResponse.json(session, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as YogaClass;

  if (!body.id || !body.day || !body.type?.trim() || !body.time?.trim() || !body.duration?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const session = await updateSession(body.id, {
    day: body.day,
    type: body.type.trim(),
    time: body.time.trim(),
    duration: body.duration.trim(),
    bg: body.bg || "#2980B922",
    color: body.color || "#1E6FA8",
    spots: Number(body.spots) || 8,
    special: Boolean(body.special),
    note: body.note?.trim() || undefined,
  });

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function DELETE(request: Request) {  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const removed = await deleteSession(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
