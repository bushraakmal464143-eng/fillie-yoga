import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/user-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearUserSession(response);
  return response;
}
