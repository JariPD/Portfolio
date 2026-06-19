import type { Metadata } from "next";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Jari Dijk",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main>
      <section className="section" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 520 }}>
          <p className="eyebrow">404</p>
          <h1 style={{ marginBottom: 16 }}>Page not found</h1>
          <p className="lead" style={{ marginBottom: 32 }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <Button href="/">Back home</Button>
            <Button variant="secondary" href="/projects">View projects</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
