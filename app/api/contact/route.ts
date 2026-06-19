import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Field caps mirror the client (components/ContactForm.tsx) and add a hard maximum so
// a direct POST can't submit a multi-megabyte payload.
const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 200 },
  message: { min: 10, max: 5000 },
};

// Per-IP rate limiting backed by Upstash Redis (durable across serverless instances).
// Only enabled when the Upstash env vars are present, so local/preview deployments
// without them still work — they just skip throttling.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        prefix: "ratelimit:contact",
      })
    : null;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  // Fail fast (and loudly in logs) if email delivery isn't configured, rather than
  // sending `to: [undefined]` and surfacing a generic failure to the user.
  // Note: `from: noreply@jaridijk.nl` also requires a verified Resend domain.
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    console.error("Contact form misconfigured: RESEND_API_KEY and/or CONTACT_EMAIL is unset");
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 500 });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(clientIp(request));
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // A non-JSON body would otherwise make `request.json()` throw an unhandled 500.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message, website } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: real users never fill `website`. If filled, drop silently (fake success — no signal to bot).
  if (website) {
    console.warn("Contact honeypot triggered, dropping submission");
    return NextResponse.json({ success: true });
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  // Strip CR/LF from the name: it flows into the email Subject header, and newlines
  // there are the classic email-header-injection vector. Defense in depth — Resend's
  // JSON API already encodes headers, but a name legitimately never contains newlines.
  const trimmedName = name.replace(/[\r\n]+/g, " ").trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  // Enforce the same length rules as the client, plus a maximum on every field.
  if (
    trimmedName.length < LIMITS.name.min ||
    trimmedName.length > LIMITS.name.max ||
    trimmedEmail.length === 0 ||
    trimmedEmail.length > LIMITS.email.max ||
    trimmedMessage.length < LIMITS.message.min ||
    trimmedMessage.length > LIMITS.message.max
  ) {
    return NextResponse.json({ error: "Please check your input and try again." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Contact Form <noreply@jaridijk.nl>",
    to: [process.env.CONTACT_EMAIL],
    replyTo: trimmedEmail,
    subject: `New contact form submission from ${escape(trimmedName)}`,
    html: `
      <p><strong>Name:</strong> ${escape(trimmedName)}</p>
      <p><strong>Email:</strong> ${escape(trimmedEmail)}</p>
      <p><strong>Message:</strong></p>
      <p>${escape(trimmedMessage).replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
