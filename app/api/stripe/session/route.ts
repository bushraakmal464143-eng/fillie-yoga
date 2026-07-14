import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Checkout is not complete" }, { status: 400 });
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;

    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription found for this checkout" }, { status: 404 });
    }

    return NextResponse.json({
      subscriptionId,
      customerEmail: session.customer_details?.email ?? null,
      customerName: session.customer_details?.name ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
