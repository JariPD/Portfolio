import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPostsByAuthor } from "@/lib/blog";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import DeletePostButton from "@/components/DeletePostButton";
import StatsRow from "@/components/StatsRow";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const posts = await getPostsByAuthor(session.user.email);
  const published = posts.filter((p) => p.status === "published").length;
  const pending = posts.filter((p) => p.status === "pending").length;
  const rejected = posts.filter((p) => p.status === "rejected").length;

  return (
    <main className="section">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>My Dashboard</h1>
            <p style={{ fontSize: 14, color: "var(--color-gray-text)" }}>
              Welcome back, {session.user.name ?? session.user.email}
            </p>
          </div>
          <Button variant="primary" href="/blog/new">New post</Button>
        </div>

        {/* Stats */}
        <StatsRow published={published} pending={pending} rejected={rejected} />

        {/* Post list */}
        <div className="posts-section">
          <h2>My blog posts</h2>
          {posts.length === 0 ? (
            <div className="posts-list" style={{ textAlign: "center", padding: 48 }}>
              <p style={{ color: "var(--color-gray-text)", marginBottom: 16 }}>
                You haven&apos;t written any posts yet.
              </p>
              <Button variant="primary" href="/blog/new">Write your first post</Button>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-row">
                  <div className="post-row-main">
                    {post.status === "published" ? (
                      <Link href={`/blog/${post.slug}`} className="post-title">
                        {post.title}
                      </Link>
                    ) : (
                      <span className="post-title">{post.title}</span>
                    )}
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="post-row-meta">
                    <span style={{ fontSize: 13, color: "var(--color-gray-text)" }}>{post.date}</span>
                    <DeletePostButton postId={post.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
