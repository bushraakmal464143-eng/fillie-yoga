import { NextResponse } from "next/server";
import { sendSignupOtp } from "@/lib/supabase-user";
import { isMailConfigured } from "@/lib/mail";

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

  if (!isMailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add SMTP settings to .env.local to send verification codes.",
      },
      { status: 503 },
    );
  }

  const result = await sendSignupOtp({ name, email });
  if (result.error) {
    const status = result.error.includes("exists")
      ? 409
      : result.error.toLowerCase().includes("wait")
        ? 429
        : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
