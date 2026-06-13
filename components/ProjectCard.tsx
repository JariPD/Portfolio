"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/projects";
import { formatProjectDate } from "@/lib/format";
import ProjectModal from "./ProjectModal";

/* Project preview card — styles live in globals.css (.card, .tag, .btn-primary) */
export default function ProjectCard({ project, index, allProjects }: {
  project: Project;
  index: number;
  allProjects: Project[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="card reveal" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16, transition: "box-shadow 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.14)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
      >
        <div>
          {/* Thumbnail */}
          <div style={{
            width: "100%", aspectRatio: "16/9", borderRadius: 6, marginBottom: 16, overflow: "hidden",
            background: "linear-gradient(135deg, var(--color-light-gray) 0%, var(--color-border) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {project.thumbnail
              ? <Image src={project.thumbnail} alt={project.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px" className="project-thumb-img" priority={index < 3} />
              : <span style={{ fontSize: 36, fontWeight: 700, color: "var(--color-gray-text)", opacity: 0.5, letterSpacing: -1 }}>
                  {project.title.split(" ").map((w) => w[0]).join("").slice(0, 3)}
                </span>
            }
          </div>
          <h3 style={{ marginBottom: 8 }}>{project.title}</h3>
          <p style={{ fontSize: 14, color: "var(--color-gray-text)", margin: "8px 0 8px", lineHeight: 1.6 }}>
            {project.shortDescription}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-gray-text)", marginBottom: 12 }}>
            {formatProjectDate(project.year, project.month)}
          </p>
          <div className="tag-list">
            {project.tech.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          View details
        </button>
      </div>

      {open && (
        <ProjectModal
          allProjects={allProjects}
          initialIndex={index}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
