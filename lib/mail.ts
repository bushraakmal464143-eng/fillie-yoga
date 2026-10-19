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
  // Gmail App Passwords are often copied with spaces — strip them.
  const pass = requireMailEnv("SMTP_PASS").replace(/\s+/g, "");
  const fromRaw = process.env.SMTP_FROM?.trim() || user;
  const from = fromRaw.replace(/^["']|["']$/g, "");
  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
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

export async function sendPasswordResetOtpEmail(input: {
  to: string;
  name?: string;
  code: string;
}): Promise<void> {
  const firstName = input.name?.trim().split(/\s+/)[0] || "there";
  const subject = "Reset your Om At Home password";
  const text = `Hi ${firstName},

Your password reset code is ${input.code}.

It expires in 10 minutes. If you did not request a password reset, you can ignore this email.

— Om At Home`;

  const html = `
  <div style="font-family:Georgia,serif;background:#faf5ee;padding:32px 20px;color:#2c1a0e;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid rgba(139,94,60,.18);border-radius:16px;padding:28px 24px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8b5e3c;">Om At Home</p>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:500;">Reset your password</h1>
      <p style="margin:0 0 20px;line-height:1.55;color:#8b5e3c;">Hi ${firstName}, use this code to choose a new password:</p>
      <p style="margin:0 0 20px;font-size:34px;letter-spacing:.28em;font-weight:700;text-align:center;color:#2c1a0e;">${input.code}</p>
      <p style="margin:0;line-height:1.55;color:#8b5e3c;font-size:14px;">This code expires in 10 minutes. If you didn’t request a reset, you can ignore this email.</p>
    </div>
  </div>`;

  await sendMail({ to: input.to, subject, text, html });
}

export async function sendTrialBookingEmail(input: {
  to: string;
  name: string;
  classType: string;
  day: string;
  time: string;
  duration: string;
  meetingUrl?: string;
}): Promise<void> {
  const firstName = input.name.trim().split(/\s+/)[0] || "there";
  const subject = `Trial booked: ${input.classType} · ${input.day} at ${input.time}`;
  const joinLine = input.meetingUrl
    ? `Join link: ${input.meetingUrl}`
    : "Join from the Om At Home schedule on the website at this day and time.";

  const text = `Hi ${firstName},

Thank you for booking a free trial lesson with Om At Home.

Your trial lesson is booked:
• Class: ${input.classType}
• Day: ${input.day}
• Time: ${input.time}
• Duration: ${input.duration}

${joinLine}

We look forward to practicing with you.

— Om At Home`;

  const meetingHtml = input.meetingUrl
    ? `<p style="margin:16px 0 0;"><a href="${input.meetingUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#2c1a0e;color:#e8d5b7;text-decoration:none;font-size:13px;letter-spacing:.06em;text-transform:uppercase;">Join Zoom meeting</a></p>`
    : `<p style="margin:16px 0 0;line-height:1.55;color:#8b5e3c;font-size:14px;">Please join from the schedule on the Om At Home website at this day and time.</p>`;

  const html = `
  <div style="font-family:Georgia,serif;background:#faf5ee;padding:32px 20px;color:#2c1a0e;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid rgba(139,94,60,.18);border-radius:16px;padding:28px 24px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8b5e3c;">Om At Home</p>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:500;">Your trial lesson is booked</h1>
      <p style="margin:0 0 18px;line-height:1.55;color:#8b5e3c;">Hi ${firstName}, thank you for booking. Here are your class details:</p>
      <div style="margin:0 0 8px;padding:18px 18px;border-radius:12px;background:#faf5ee;border:1px solid rgba(139,94,60,.14);">
        <p style="margin:0 0 10px;font-size:20px;color:#2c1a0e;"><strong>${input.classType}</strong></p>
        <p style="margin:0 0 6px;line-height:1.5;color:#8b5e3c;font-size:15px;"><strong>Day:</strong> ${input.day}</p>
        <p style="margin:0 0 6px;line-height:1.5;color:#8b5e3c;font-size:15px;"><strong>Time:</strong> ${input.time}</p>
        <p style="margin:0;line-height:1.5;color:#8b5e3c;font-size:15px;"><strong>Duration:</strong> ${input.duration}</p>
        ${meetingHtml}
      </div>
      <p style="margin:18px 0 0;line-height:1.55;color:#8b5e3c;font-size:14px;">We look forward to practicing with you.</p>
    </div>
  </div>`;

  await sendMail({ to: input.to, subject, text, html });
}
