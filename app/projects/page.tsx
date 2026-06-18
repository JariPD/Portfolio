import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import RevealInit from "@/components/RevealInit";

export const metadata: Metadata = {
  title: "Projects — Jari Dijk",
  description: "All projects by Jari Dijk, full-stack developer based in The Hague.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <main>
      <RevealInit />
      <section className="section">
        <div className="container">
          <div className="section-heading reveal">
            <Link
              href="/"
              style={{ fontSize: 14, color: "var(--color-accent)", textDecoration: "none" }}
            >
              ← Back to home
            </Link>
            <h1 style={{ marginTop: 12 }}>All Projects</h1>
            <p className="text-gray">Everything I&apos;ve built or contributed to.</p>
          </div>
          <div className="projects-grid">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} allProjects={projects} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
