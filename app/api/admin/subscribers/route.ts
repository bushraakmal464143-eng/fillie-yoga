import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export type SubscriberRow = {
  subscriptionId: string;
  status: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  addressLine: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  createdAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  cardBrand: string;
  cardLast4: string;
};

function formatUnix(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  return new Date(seconds * 1000).toLocaleString();
}

function customerFields(customer: Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer || customer.deleted) {
    return {
      customerId: "",
      name: "Unknown",
      email: "—",
      phone: "—",
      country: "—",
      city: "—",
      state: "—",
      postalCode: "—",
      addressLine: "—",
    };
  }

  const address = customer.address;
  const line = [address?.line1, address?.line2].filter(Boolean).join(", ");

  return {
    customerId: customer.id,
    name: customer.name || "—",
    email: customer.email || "—",
    phone: customer.phone || "—",
    country: address?.country || "—",
    city: address?.city || "—",
    state: address?.state || "—",
    postalCode: address?.postal_code || "—",
    addressLine: line || "—",
  };
}

function mapSubscription(
  sub: Stripe.Subscription,
  productNames: Map<string, string>,
): SubscriberRow {
  const customer =
    typeof sub.customer === "object" ? sub.customer : null;
  const item = sub.items.data[0];
  const price = item?.price;
  const productId = typeof price?.product === "string" ? price.product : price?.product?.id;
  const planName =
    sub.metadata?.planName ||
    (productId ? productNames.get(productId) : undefined) ||
    price?.nickname ||
    (price?.unit_amount != null
      ? `Membership (${(price.unit_amount / 100).toFixed(0)}/${price.recurring?.interval ?? "mo"})`
      : "Membership");

  const pm =
    typeof sub.default_payment_method === "object" && sub.default_payment_method
      ? sub.default_payment_method
      : null;
  const card = pm && "card" in pm ? pm.card : null;

  const periodStart =
    (item as { current_period_start?: number } | undefined)?.current_period_start ??
    (sub as { current_period_start?: number }).current_period_start;
  const periodEnd =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as { current_period_end?: number }).current_period_end;

  return {
    subscriptionId: sub.id,
    status: sub.status,
    ...customerFields(customer),
    planName,
    amount: (price?.unit_amount ?? 0) / 100,
    currency: (price?.currency ?? "usd").toUpperCase(),
    interval: price?.recurring?.interval ?? "month",
    createdAt: formatUnix(sub.created),
    currentPeriodStart: formatUnix(periodStart),
    currentPeriodEnd: formatUnix(periodEnd),
    canceledAt: sub.canceled_at ? formatUnix(sub.canceled_at) : null,
    cardBrand: card?.brand ? card.brand.toUpperCase() : "—",
    cardLast4: card?.last4 ?? "—",
  };
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured", subscribers: [] },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const result = await stripe.subscriptions.list({
      limit: 100,
      status: "all",
      expand: ["data.customer", "data.default_payment_method"],
    });

    const productIds = Array.from(
      new Set(
        result.data
          .map((sub) => {
            const product = sub.items.data[0]?.price?.product;
            return typeof product === "string" ? product : product?.id;
          })
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const productNames = new Map<string, string>();
    await Promise.all(
      productIds.map(async (id) => {
        try {
          const product = await stripe.products.retrieve(id);
          if (!product.deleted) productNames.set(id, product.name);
        } catch {
          // ignore missing products
        }
      }),
    );

    const removedStatuses = new Set(["canceled", "incomplete_expired", "unpaid"]);
    const subscribers = result.data
      .filter((sub) => !removedStatuses.has(sub.status))
      .map((sub) => mapSubscription(sub, productNames))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
      activeCount: subscribers.filter((row) => row.status === "active").length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load subscribers";
    return NextResponse.json({ error: message, subscribers: [] }, { status: 500 });
  }
}
