import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllPosts } from "@/lib/blog";
import StatusBadge from "@/components/StatusBadge";
import AdminActions from "@/components/AdminActions";
import StatsRow from "@/components/StatsRow";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const posts = await getAllPosts();
  const published = posts.filter((p) => p.status === "published").length;
  const pending = posts.filter((p) => p.status === "pending").length;
  const rejected = posts.filter((p) => p.status === "rejected").length;

  return (
    <main className="section">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Blog Moderation</h1>
          <p style={{ fontSize: 14, color: "var(--color-gray-text)" }}>Review and moderate community posts.</p>
        </div>

        {/* Stats */}
        <StatsRow published={published} pending={pending} rejected={rejected} />

        {/* Posts list */}
        <div className="posts-section">
          <h2>Posts for review</h2>
        </div>
        <div className="admin-posts-list">
          {posts.map((post, idx) => (
            <div key={post.id} className="admin-post-row" style={{ borderBottom: idx < posts.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div className="admin-post-header">
                <div className="admin-post-meta">
                  <strong style={{ fontSize: 15, color: "var(--color-text)" }}>{post.title}</strong>
                  <StatusBadge status={post.status} />
                </div>
                <AdminActions postId={post.id} currentStatus={post.status} userId={post.userId} authorName={post.authorName}/>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--color-gray-text)" }}>{post.author}</span>
                <span style={{ fontSize: 13, color: "var(--color-gray-text)" }}>·</span>
                <span style={{ fontSize: 13, color: "var(--color-gray-text)" }}>{post.date}</span>
              </div>
              <p className="admin-post-preview">{post.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
