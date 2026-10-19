import { NextRequest, NextResponse } from "next/server";
import { fulfillCheckoutSession, fulfillStripeSubscription } from "@/lib/subscription-fulfill";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    const subscriptionIdParam = request.nextUrl.searchParams.get("subscription_id");

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    if (sessionId) {
      const result = await fulfillCheckoutSession(sessionId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        subscriptionId: result.subscriptionId,
        customerEmail: result.customerEmail,
        customerName: result.customerName,
        recorded: result.recorded,
        emailed: result.emailed,
        emailError: result.error ?? null,
      });
    }

    if (subscriptionIdParam) {
      const result = await fulfillStripeSubscription({
        subscriptionId: subscriptionIdParam,
      });
      return NextResponse.json({
        subscriptionId: subscriptionIdParam,
        recorded: result.recorded,
        emailed: result.emailed,
        emailError: result.error ?? null,
      });
    }

    return NextResponse.json(
      { error: "Missing session_id or subscription_id" },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
