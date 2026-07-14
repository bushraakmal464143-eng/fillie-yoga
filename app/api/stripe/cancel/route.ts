import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      subscriptionId?: string;
    };

    const subscriptionId = body.subscriptionId?.trim();
    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }

    const stripe = getStripe();
    const canceled = await stripe.subscriptions.cancel(subscriptionId);

    return NextResponse.json({
      ok: true,
      status: canceled.status,
      subscriptionId: canceled.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not cancel subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
