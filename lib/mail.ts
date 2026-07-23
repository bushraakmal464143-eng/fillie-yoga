import nodemailer from "nodemailer";

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM || process.env.SMTP_USER),
  );
}

function requireMailEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in environment`);
  return value;
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const host = requireMailEnv("SMTP_HOST");
  const user = requireMailEnv("SMTP_USER");
  const pass = requireMailEnv("SMTP_PASS");
  const from = process.env.SMTP_FROM?.trim() || user;
  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export async function sendSignupOtpEmail(input: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const firstName = input.name.trim().split(/\s+/)[0] || "there";
  const subject = "Your Om At Home verification code";
  const text = `Hi ${firstName},

Your verification code is ${input.code}.

It expires in 10 minutes. If you did not request this, you can ignore this email.

— Om At Home`;

  const html = `
  <div style="font-family:Georgia,serif;background:#faf5ee;padding:32px 20px;color:#2c1a0e;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid rgba(139,94,60,.18);border-radius:16px;padding:28px 24px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8b5e3c;">Om At Home</p>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:500;">Verify your email</h1>
      <p style="margin:0 0 20px;line-height:1.55;color:#8b5e3c;">Hi ${firstName}, use this code to finish creating your account:</p>
      <p style="margin:0 0 20px;font-size:34px;letter-spacing:.28em;font-weight:700;text-align:center;color:#2c1a0e;">${input.code}</p>
      <p style="margin:0;line-height:1.55;color:#8b5e3c;font-size:14px;">This code expires in 10 minutes. If you didn’t request it, you can ignore this email.</p>
    </div>
  </div>`;

  await sendMail({ to: input.to, subject, text, html });
}
