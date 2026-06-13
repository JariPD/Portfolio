import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { displayName } from "@/lib/users";

/* Blog post preview card — styles live in globals.css (.blog-card*) */
export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card reveal">
      <div className="blog-card-meta">
        <span className="text-small">{displayName(post.author)}</span>
        <span className="text-small">{formatDate(post.date)}</span>
      </div>
      <h3>{post.title}</h3>
      <p className="blog-card-preview">{post.preview}</p>
      <span className="blog-card-read-more">Read more →</span>
    </Link>
  );
}
