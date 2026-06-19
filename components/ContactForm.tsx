"use client";

import React, { useState, useEffect, useRef } from "react";

type FieldErrors = { name?: string; email?: string; message?: string };
type Field = "name" | "email" | "message";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Single source of truth for field validation. Both the full-form check (on submit)
// and the per-field check (on blur) run these, so a field's error message never
// depends on which path triggered it.
const RULES: Record<Field, (value: string) => string | undefined> = {
  name: (v) => (v.trim().length < 2 ? "Please enter your name (at least 2 characters)" : undefined),
  email: (v) => (EMAIL_RE.test(v) ? undefined : "Please enter a valid email address"),
  message: (v) => (v.trim().length < 10 ? "Please enter your message (at least 10 characters)" : undefined),
};

function fieldStyle(error?: string, success?: boolean) {
  return {
    height: 44, border: `1.5px solid ${error ? "var(--color-error)" : success ? "var(--color-success)" : "var(--color-border)"}`,
    borderRadius: 6, padding: "0 12px", fontSize: 16, fontFamily: "inherit",
    color: "var(--color-text)", background: "var(--color-white)",
    outline: "none", width: "100%", boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
}

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  // Honeypot: hidden field real users never fill. Bots auto-fill it → server drops the message.
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function validate(): FieldErrors {
    return {
      name: RULES.name(values.name),
      email: RULES.email(values.email),
      message: RULES.message(values.message),
    };
  }

  function validateField(name: Field, value: string) {
    setErrors((prev) => ({ ...prev, [name]: RULES[name](value) }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ message: data.error ?? "Failed to send message. Please try again." });
        return;
      }
      setValues({ name: "", email: "", message: "" });
      setTouched({});
      setSuccess(true);
      timerRef.current = setTimeout(() => setSuccess(false), 7000);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{
        background: "#F0FFF4", border: "1px solid #9AE6B4",
        borderRadius: 8, padding: 32, textAlign: "center", color: "var(--color-success)",
      }}>
        <h3 style={{ color: "var(--color-success)", marginBottom: 8 }}>Message sent!</h3>
        <p>Thanks for reaching out. I&apos;ll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot — offscreen, hidden from real users & assistive tech. Bots fill it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      {(["name", "email", "message"] as const).map((field) => (
        <div key={field} className="form-field">
          <label htmlFor={`contact-${field}`} className="form-label">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          {field === "message" ? (
            <textarea
              id="contact-message"
              value={values.message}
              onChange={(e) => { setValues((v) => ({ ...v, message: e.target.value })); if (errors.message) setErrors((err) => ({ ...err, message: undefined })); }}
              onBlur={() => { setTouched((t) => ({ ...t, message: true })); validateField("message", values.message); }}
              placeholder="Tell me about your project or question…"
              style={{
                border: `1.5px solid ${errors.message ? "var(--color-error)" : touched.message && !errors.message && values.message.trim().length >= 10 ? "var(--color-success)" : "var(--color-border)"}`,
                borderRadius: 6, padding: 12, fontSize: 16, fontFamily: "inherit",
                color: "var(--color-text)", background: "var(--color-white)",
                outline: "none", width: "100%", height: 120, resize: "vertical",
                transition: "border-color 0.15s",
              }}
            />
          ) : (
            <input
              id={`contact-${field}`}
              type={field === "email" ? "email" : "text"}
              value={values[field]}
              onChange={(e) => { setValues((v) => ({ ...v, [field]: e.target.value })); if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined })); }}
              onBlur={() => { setTouched((t) => ({ ...t, [field]: true })); validateField(field, values[field]); }}
              placeholder={field === "name" ? "Your name" : "your@email.com"}
              style={fieldStyle(errors[field], touched[field] && !errors[field] && values[field].trim().length > 0)}
            />
          )}
          {errors[field] && <span style={{ fontSize: 13, color: "var(--color-error)", minHeight: 18 }}>{errors[field]}</span>}
        </div>
      ))}
      <button type="submit" disabled={submitting}
        className="btn-primary btn-full">
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
