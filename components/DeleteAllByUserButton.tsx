"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAllByUserButton({ userId, authorName}: { userId: string, authorName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete all posts by user?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/posts`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-outline-danger"
    >
      Delete all posts by user {authorName}
    </button>
  );
}
