import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  role: string;
};

export type AdminLoginEvent = {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  eventType: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AdminSubscription = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
};

export type AdminBooking = {
  id: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  bookingType: string;
  sessionId: number;
  bookedAt: string;
  cancelledAt: string | null;
};

function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return headers.get("x-real-ip");
}

export async function recordAuthEvent(input: {
  userId?: string | null;
  email: string;
  name?: string;
  eventType: "login" | "signup" | "logout";
  headers?: Headers;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("login_events").insert({
      user_id: input.userId ?? null,
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim() ?? "",
      event_type: input.eventType,
      ip_address: input.headers ? clientIpFromHeaders(input.headers) : null,
      user_agent: input.headers?.get("user-agent") ?? null,
    });
    if (error) {
      console.warn("[login_events]", error.message);
    }
  } catch (error) {
    console.warn("[login_events]", error);
  }
}

async function listAuthUsers(): Promise<AdminMember[]> {
  const admin = createAdminClient();
  const members: AdminMember[] = [];
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    for (const user of data.users) {
      members.push({
        id: user.id,
        name: (user.user_metadata?.name as string | undefined) ?? "",
        email: user.email ?? "",
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        emailConfirmed: Boolean(user.email_confirmed_at),
        role: "member",
      });
    }

    if (data.users.length < 100) break;
    page += 1;
  }

  if (!members.length) return members;

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, name, email, role")
    .in(
      "id",
      members.map((member) => member.id),
    );

  const byId = new Map((profiles ?? []).map((profile) => [profile.id as string, profile]));

  return members.map((member) => {
    const profile = byId.get(member.id);
    return {
      ...member,
      name: (profile?.name as string | undefined) || member.name,
      email: (profile?.email as string | undefined) || member.email,
      role: (profile?.role as string | undefined) || member.role,
    };
  });
}

async function listLoginEvents(): Promise<AdminLoginEvent[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("login_events")
    .select("id, user_id, email, name, event_type, ip_address, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (error.message?.toLowerCase().includes("login_events")) return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: (row.user_id as string | null) ?? null,
    email: row.email as string,
    name: (row.name as string) ?? "",
    eventType: row.event_type as string,
    ipAddress: (row.ip_address as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

async function listSubscriptions(): Promise<AdminSubscription[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select(
      "id, user_id, plan_id, status, current_period_start, current_period_end, created_at, profiles(name, email), pricing_plans(name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    // Fallback without joins if relationships are missing.
    const fallback = await admin
      .from("subscriptions")
      .select("id, user_id, plan_id, status, current_period_start, current_period_end, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (fallback.error) return [];

    return (fallback.data ?? []).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      userName: "",
      userEmail: "",
      planId: row.plan_id as string,
      planName: row.plan_id as string,
      status: row.status as string,
      currentPeriodStart: (row.current_period_start as string | null) ?? null,
      currentPeriodEnd: (row.current_period_end as string | null) ?? null,
      createdAt: row.created_at as string,
    }));
  }

  return (data ?? []).map((row) => {
    const profileRaw = row.profiles as
      | { name?: string; email?: string }
      | { name?: string; email?: string }[]
      | null;
    const planRaw = row.pricing_plans as { name?: string } | { name?: string }[] | null;
    const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
    const plan = Array.isArray(planRaw) ? planRaw[0] : planRaw;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      userName: profile?.name ?? "",
      userEmail: profile?.email ?? "",
      planId: row.plan_id as string,
      planName: plan?.name ?? (row.plan_id as string),
      status: row.status as string,
      currentPeriodStart: (row.current_period_start as string | null) ?? null,
      currentPeriodEnd: (row.current_period_end as string | null) ?? null,
      createdAt: row.created_at as string,
    };
  });
}

async function listBookings(): Promise<AdminBooking[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bookings")
    .select("id, user_id, guest_name, guest_email, booking_type, session_id, booked_at, cancelled_at")
    .order("booked_at", { ascending: false })
    .limit(200);

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: (row.user_id as string | null) ?? null,
    guestName: (row.guest_name as string | null) ?? null,
    guestEmail: (row.guest_email as string | null) ?? null,
    bookingType: row.booking_type as string,
    sessionId: row.session_id as number,
    bookedAt: row.booked_at as string,
    cancelledAt: (row.cancelled_at as string | null) ?? null,
  }));
}

export async function getAdminMemberInsights(): Promise<{
  members: AdminMember[];
  logins: AdminLoginEvent[];
  subscriptions: AdminSubscription[];
  bookings: AdminBooking[];
  supabaseConfigured: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      members: [],
      logins: [],
      subscriptions: [],
      bookings: [],
      supabaseConfigured: false,
    };
  }

  const [members, logins, subscriptions, bookings] = await Promise.all([
    listAuthUsers(),
    listLoginEvents(),
    listSubscriptions(),
    listBookings(),
  ]);

  return {
    members,
    logins,
    subscriptions,
    bookings,
    supabaseConfigured: true,
  };
}
