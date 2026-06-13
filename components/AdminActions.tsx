"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Status } from "@/lib/blog";
import DeletePostButton from "@/components/DeletePostButton";
import DeleteAllByUserButton from "@/components/DeleteAllByUserButton";

export default function AdminActions({
  postId, userId,
  currentStatus, 
    authorName
}: {
  postId: string;
  userId: string;
  currentStatus: Status;
  authorName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function setStatus(status: Status) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/posts/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("Failed to update status.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 13, color: "var(--color-error)", marginBottom: 6 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {currentStatus !== "published" && (
          <button onClick={() => setStatus("published")} disabled={loading} className="btn-success">
            Approve
          </button>
        )}
        {currentStatus !== "rejected" && (
          <button onClick={() => setStatus("rejected")} disabled={loading} className="btn-danger">
            Reject
          </button>
        )}
        {currentStatus !== "pending" && (
          <button onClick={() => setStatus("pending")} disabled={loading} className="btn-outline">
            Set Pending
          </button>
        )}
        <DeletePostButton postId={postId} />
        <DeleteAllByUserButton userId={userId} authorName={authorName} />
      </div>
    </div>
  );
}
