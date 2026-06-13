"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function BlogPostForm({ authorEmail }: { authorEmail: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setTitle("");
      setContent("");
      setSuccess(true);
      router.refresh();
      timerRef.current = setTimeout(() => setSuccess(false), 7000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h3 style={{ marginBottom: 24 }}>Write a post</h3>

      {success && (
        <div className="alert-success">Post submitted! It will appear after admin review.</div>
      )}
      {error && (
        <div className="alert-error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title" className="input"
          />
        </div>
        <div className="form-field" style={{ marginBottom: 24 }}>
          <label className="form-label">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here…"
            className="input"
            style={{ height: 200, resize: "vertical", padding: 12 }}
          />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-gray-text)", marginBottom: 16 }}>
          Posting as <strong style={{ color: "var(--color-text)" }}>{authorEmail}</strong>
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting…" : "Submit post"}
          </button>
        </div>
      </form>
    </div>
  );
}
