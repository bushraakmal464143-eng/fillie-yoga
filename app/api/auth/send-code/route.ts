import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { sendSignupOtp } from "@/lib/supabase-user";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";

  if (!name || !email) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const result = await sendSignupOtp({ name, email });
  if (result.error) {
    const status = result.error.includes("exists") ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
