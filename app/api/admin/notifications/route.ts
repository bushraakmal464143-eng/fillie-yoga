import { NextResponse } from "next/server";
import { getRecentTrialNotifications } from "@/lib/admin-members";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const data = await getRecentTrialNotifications(15);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load notifications.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
