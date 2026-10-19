import { NextResponse } from "next/server";
import { isMailConfigured } from "@/lib/mail";
import { sendPasswordResetOtp } from "@/lib/supabase-user";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim() ?? "";

  if (!email) {
    return NextResponse.json({ error: "Please enter your email." }, { status: 400 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add SMTP settings in Vercel Environment Variables (or .env locally).",
      },
      { status: 503 },
    );
  }

  try {
    const result = await sendPasswordResetOtp({ email });
    if (result.error) {
      const status = result.error.toLowerCase().includes("wait") ? 429 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      ok: true,
      message:
        result.message ??
        "If an account exists for that email, we sent a password reset code. Check your inbox.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    const message = err instanceof Error ? err.message : "Could not start password reset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
