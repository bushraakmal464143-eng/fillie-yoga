import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getPricing } from "@/lib/store";
import { getStripe, toRecurringInterval, toStripeCurrency } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign up or log in before subscribing." },
        { status: 401 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env" },
        { status: 500 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      planId?: string;
    };

    const plans = await getPricing();
    const plan =
      (body.planId ? plans.find((item) => item.id === body.planId) : null) ??
      plans.find((item) => item.highlighted) ??
      plans[0];

    if (!plan) {
      return NextResponse.json({ error: "No pricing plan found" }, { status: 404 });
    }

    const origin = request.nextUrl.origin;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: toStripeCurrency(plan.currency),
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: toRecurringInterval(plan.period),
            },
            product_data: {
              name: plan.name,
              description: plan.features.slice(0, 3).join(" · ") || undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#book-app`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        userId: user.id,
        userEmail: user.email,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
          userId: user.id,
          userEmail: user.email,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
