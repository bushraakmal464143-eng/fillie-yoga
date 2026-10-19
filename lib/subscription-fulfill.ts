import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMailConfigured, sendNewSubscriberNotifyEmail } from "@/lib/mail";
import { CONTACT_EMAIL } from "@/lib/routes";
import { getStripe } from "@/lib/stripe";

function mapStatus(status: Stripe.Subscription.Status): string {
  if (status === "canceled") return "cancelled";
  if (status === "active" || status === "trialing" || status === "past_due") return status;
  if (status === "unpaid" || status === "incomplete" || status === "incomplete_expired") {
    return "past_due";
  }
  return "active";
}

function amountLabel(sub: Stripe.Subscription): string {
  const price = sub.items.data[0]?.price;
  if (!price?.unit_amount) return "—";
  const amount = (price.unit_amount / 100).toFixed(2);
  const currency = (price.currency || "usd").toUpperCase();
  const interval = price.recurring?.interval ?? "month";
  return `${currency} ${amount}/${interval}`;
}

export async function fulfillStripeSubscription(input: {
  subscriptionId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  userId?: string | null;
  planId?: string | null;
  planName?: string | null;
}): Promise<{ recorded: boolean; emailed: boolean; error?: string }> {
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(input.subscriptionId, {
    expand: ["customer"],
  });

  const customer =
    typeof sub.customer === "object" && sub.customer && !sub.customer.deleted
      ? sub.customer
      : null;

  const email =
    (input.customerEmail || customer?.email || sub.metadata?.userEmail || "").trim().toLowerCase();
  const name =
    (input.customerName || customer?.name || sub.metadata?.userName || email.split("@")[0] || "Member").trim();
  let userId = (input.userId || sub.metadata?.userId || "").trim() || null;
  const planId = (input.planId || sub.metadata?.planId || "plan-monthly").trim();
  const planName =
    (input.planName || sub.metadata?.planName || "Om At Home Monthly").trim();

  const periodStart =
    (sub.items.data[0] as { current_period_start?: number } | undefined)?.current_period_start ??
    (sub as { current_period_start?: number }).current_period_start;
  const periodEnd =
    (sub.items.data[0] as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as { current_period_end?: number }).current_period_end;

  let alreadyNotified = false;
  let recorded = false;

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();

      if (!userId && email) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (profile?.id) userId = profile.id as string;
      }

      const { data: existing } = await admin
        .from("subscriptions")
        .select("id, notify_email_sent_at")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();

      alreadyNotified = Boolean(existing?.notify_email_sent_at);

      if (userId) {
        const row = {
          user_id: userId,
          plan_id: planId,
          status: mapStatus(sub.status),
          current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          stripe_subscription_id: sub.id,
          customer_email: email || null,
          customer_name: name || null,
          updated_at: new Date().toISOString(),
        };

        if (existing?.id) {
          const { error } = await admin.from("subscriptions").update(row).eq("id", existing.id);
          if (error) console.warn("[subscriptions] update:", error.message);
          else recorded = true;
        } else {
          const { error } = await admin.from("subscriptions").insert(row);
          if (error) {
            console.warn("[subscriptions] insert:", error.message);
            const { error: retryError } = await admin.from("subscriptions").insert({
              ...row,
              plan_id: "plan-monthly",
            });
            if (retryError) console.warn("[subscriptions] insert retry:", retryError.message);
            else recorded = true;
          } else {
            recorded = true;
          }
        }
      }
    } catch (error) {
      console.warn("[subscriptions]", error);
    }
  }

  let emailed = false;
  if (!alreadyNotified && email && isMailConfigured()) {
    try {
      await sendNewSubscriberNotifyEmail({
        to: CONTACT_EMAIL,
        subscriberName: name,
        subscriberEmail: email,
        planName,
        amountLabel: amountLabel(sub),
        subscriptionId: sub.id,
      });
      emailed = true;

      if (isSupabaseConfigured()) {
        const admin = createAdminClient();
        await admin
          .from("subscriptions")
          .update({ notify_email_sent_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);
      }
    } catch (error) {
      console.error("[subscriptions] notify email failed:", error);
      return {
        recorded,
        emailed: false,
        error: error instanceof Error ? error.message : "Notify email failed",
      };
    }
  }

  return { recorded, emailed };
}

export async function fulfillCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return {
      ok: false as const,
      error: "Checkout is not complete",
      subscriptionId: null as string | null,
    };
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!subscriptionId) {
    return {
      ok: false as const,
      error: "No subscription found for this checkout",
      subscriptionId: null as string | null,
    };
  }

  const result = await fulfillStripeSubscription({
    subscriptionId,
    customerEmail: session.customer_details?.email ?? session.customer_email,
    customerName: session.customer_details?.name,
    userId: session.metadata?.userId,
    planId: session.metadata?.planId,
    planName: session.metadata?.planName,
  });

  return {
    ok: true as const,
    subscriptionId,
    customerEmail: session.customer_details?.email ?? null,
    customerName: session.customer_details?.name ?? null,
    ...result,
  };
}
