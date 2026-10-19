import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/current-user";
import { isMailConfigured, sendTrialBookingEmail } from "@/lib/mail";
import { getSessions } from "@/lib/store";
import type { TrialBooking } from "@/lib/types";

type ClassDetails = {
  classType?: string;
  day?: string;
  time?: string;
  duration?: string;
  meetingUrl?: string;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ bookings: [] });
  }

  const user = await getCurrentUser();
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign up or log in before booking." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    sessionId?: number;
    bookingType?: "trial" | "member";
    guestName?: string;
    guestEmail?: string;
    classDetails?: ClassDetails;
  };

  const sessionId = Number(body.sessionId);
  const bookingType = body.bookingType ?? "trial";

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const sessions = await getSessions();
  const session = sessions.find((row) => Number(row.id) === sessionId);

  const classType = body.classDetails?.classType?.trim() || session?.type || "";
  const day = body.classDetails?.day?.trim() || session?.day || "";
  const time = body.classDetails?.time?.trim() || session?.time || "";
  const duration = body.classDetails?.duration?.trim() || session?.duration || "";
  const meetingUrl = body.classDetails?.meetingUrl?.trim() || session?.meetingUrl || undefined;

  if (bookingType === "trial" && (!classType || !day || !time || !duration)) {
    return NextResponse.json(
      { error: "That class time was not found. Please pick another time." },
      { status: 404 },
    );
  }

  const name = body.guestName?.trim() || user.name;
  const email = (body.guestEmail?.trim() || user.email).toLowerCase();

  if (bookingType === "trial" && !isMailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Booking email is not configured. Add SMTP settings so confirmation emails can be sent.",
      },
      { status: 503 },
    );
  }

  let booking: TrialBooking = {
    name,
    email,
    classId: sessionId,
    bookedAt: Date.now(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await createAdminClient()
      .from("bookings")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        booking_type: bookingType,
        guest_name: name,
        guest_email: email,
      })
      .select("session_id, guest_name, guest_email, booking_type, booked_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    booking = {
      name: data.guest_name ?? name,
      email: data.guest_email ?? email,
      classId: data.session_id,
      bookedAt: new Date(data.booked_at).getTime(),
    };
  }

  let emailSent = false;

  if (bookingType === "trial") {
    try {
      await sendTrialBookingEmail({
        to: booking.email,
        name: booking.name,
        classType,
        day,
        time,
        duration,
        meetingUrl,
      });
      emailSent = true;
    } catch (error) {
      console.error("[bookings] trial email failed:", error);
      const message = error instanceof Error ? error.message : "Could not send confirmation email.";
      return NextResponse.json(
        {
          error: `Your booking was saved, but the confirmation email failed: ${message}`,
          booking,
          emailSent: false,
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ booking, emailSent }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to cancel your trial." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { sessionId?: number };
  const sessionId = body.sessionId;

  if (isSupabaseConfigured()) {
    let query = createAdminClient()
      .from("bookings")
      .update({ cancelled_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("booking_type", "trial")
      .is("cancelled_at", null);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
