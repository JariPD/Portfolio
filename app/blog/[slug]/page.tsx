import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getPublishedPosts, getPostBySlug } from "@/lib/blog";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import { displayName } from "@/lib/users";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Jari Dijk`,
    description: post.preview,
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") notFound();

  const isAdmin  = session?.user?.role === "admin";
  const isAuthor = session?.user?.email === post.author;
  const showStatus = isAdmin || isAuthor;

  const name = displayName(post.author, post.authorName);
  /* First letter of the display name for the avatar circle */
  const avatarInitial = name.charAt(0).toUpperCase();

  return (
    <>
      {/* ── Post hero — gray header matching prototype .post-hero ── */}
      <div className="post-hero">
        <div className="container">
          {/* Breadcrumb nav: Home / Blog / Post title */}
          <nav className="post-breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <Link href="/#blog" className="breadcrumb-link">Blog</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>{post.title}</span>
          </nav>

          <h1 style={{ fontSize: 40, maxWidth: 720 }}>{post.title}</h1>

          {/* Post meta: avatar, author name, date, optional status badge */}
          <div className="post-meta">
            <div className="post-author-avatar" aria-hidden="true">{avatarInitial}</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{name}</div>
              <time style={{ fontSize: 14, color: "var(--color-gray-text)" }} dateTime={post.date}>
                {formatDate(post.date)}
              </time>
            </div>
            {showStatus && <StatusBadge status={post.status} />}
          </div>
        </div>
      </div>

      {/* ── Post body — white section ── */}
      <section>
        <div className="container">
          <div className="post-body">
            {/* Simple markdown renderer: ## headings, ``` code blocks, paragraphs */}
            {post.content.split("\n\n").map((block, i) => {
              if (block.startsWith("## ")) {
                return <h2 key={i} style={{ marginTop: 40, marginBottom: 16 }}>{block.slice(3)}</h2>;
              }
              if (block.startsWith("```")) {
                const code = block.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
                return (
                  <pre key={i} style={{
                    background: "var(--color-light-gray)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8, padding: 16, overflowX: "auto",
                    fontSize: 14, fontFamily: "var(--font-mono)", margin: "16px 0",
                  }}>
                    <code>{code}</code>
                  </pre>
                );
              }
              return (
                <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: "var(--color-text)", marginBottom: 24 }}>
                  {block}
                </p>
              );
            })}
          </div>

          <hr className="post-divider" />

          {/* Footer nav: back button left, written-by right — matches prototype */}
          <div className="post-footer-nav">
            <Link href="/#blog" className="btn-secondary">← Back to blog</Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="text-small">Written by</span>
              <strong style={{ fontSize: 14 }}>{name}</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
