import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listLoginEvents } from "@/lib/login-log";
import { listUsers } from "@/lib/user-store";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const [users, logins] = await Promise.all([listUsers(), listLoginEvents(150)]);

  return NextResponse.json({
    users,
    logins,
    userCount: users.length,
    loginCount: logins.length,
  });
}
