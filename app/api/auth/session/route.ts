import { NextResponse } from "next/server";
import { findUserById } from "@/lib/user-store";
import { getSessionUserId, toPublicUser } from "@/lib/user-auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}
