import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BlogPostForm from "@/components/BlogPostForm";

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <main className="section">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <Link href="/dashboard" className="back-link">← Back to dashboard</Link>
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>New Post</h1>
        <p style={{ color: "var(--color-gray-text)", marginBottom: 32 }}>
          Posts are reviewed before being published to the blog.
        </p>
        <BlogPostForm authorEmail={session.user.email} />
      </div>
    </main>
  );
}
