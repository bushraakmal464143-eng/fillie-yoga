import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase-user";
import type { TrialBooking } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ bookings: [] });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ bookings: [] });
  }

  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("session_id, guest_name, guest_email, booking_type, booked_at")
    .eq("user_id", user.id)
    .is("cancelled_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data ?? [] });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = (await request.json()) as {
    sessionId?: number;
    bookingType?: "trial" | "member";
    guestName?: string;
    guestEmail?: string;
  };

  const sessionId = body.sessionId;
  const bookingType = body.bookingType ?? "trial";

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const user = await getSessionUser();
  const guestName = body.guestName?.trim();
  const guestEmail = body.guestEmail?.trim();

  if (!user && (!guestName || !guestEmail)) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("bookings")
    .insert({
      user_id: user?.id ?? null,
      session_id: sessionId,
      booking_type: bookingType,
      guest_name: guestName ?? user?.name ?? null,
      guest_email: guestEmail ?? user?.email ?? null,
    })
    .select("session_id, guest_name, guest_email, booking_type, booked_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const booking: TrialBooking = {
    name: data.guest_name ?? "",
    email: data.guest_email ?? "",
    classId: data.session_id,
    bookedAt: new Date(data.booked_at).getTime(),
  };

  return NextResponse.json({ booking }, { status: 201 });
}
