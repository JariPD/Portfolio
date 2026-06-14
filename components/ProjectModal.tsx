"use client";

import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import type { Project } from "@/lib/projects";
import { formatProjectDate } from "@/lib/format";

const THUMB_VISIBLE = 5;

export default function ProjectModal({
  allProjects,
  initialIndex,
  onClose,
}: {
  allProjects: Project[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedImage, setSelectedImage] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const project = allProjects[currentIndex];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  // Keep selectedImage in sync with carousel, and ensure it stays visible in the thumb strip
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const snap = emblaApi.selectedScrollSnap();
      setSelectedImage(snap);
      setThumbOffset((offset) => {
        if (snap < offset) return snap;
        if (snap >= offset + THUMB_VISIBLE) return snap - THUMB_VISIBLE + 1;
        return offset;
      });
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi]);

  // Reset carousel and thumb strip when switching projects.
  // Deliberate setState-on-prop-change; disable the strict effect rule here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedImage(0);
    setThumbOffset(0);
    emblaApi?.scrollTo(0, true);
  }, [currentIndex, emblaApi]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && currentIndex < allProjects.length - 1)
        setCurrentIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && currentIndex > 0)
        setCurrentIndex((i) => i - 1);
    },
    [onClose, currentIndex, allProjects.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const hasDemo = Boolean(project.demoUrl);
  const hasGithub = Boolean(project.githubUrl);

  const thumbImages = project.images.slice(thumbOffset, thumbOffset + THUMB_VISIBLE);
  const canThumbPrev = thumbOffset > 0;
  const canThumbNext = thumbOffset + THUMB_VISIBLE < project.images.length;

  const navBtn = (style?: React.CSSProperties): React.CSSProperties => ({
    width: 28, height: 40, border: "1px solid var(--color-border)",
    background: "var(--color-light-gray)", borderRadius: 4, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, flexShrink: 0, transition: "background 0.15s",
    ...style,
  });

  return (
    <div
      style={{
        display: "flex", position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)", zIndex: 200,
        alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-white)", borderRadius: 12,
          maxWidth: 900, width: "100%", maxHeight: "90vh",
          overflowY: "auto", position: "relative",
          boxShadow: "0 16px 64px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 32px", borderBottom: "1px solid var(--color-border)",
          position: "sticky", top: 0, background: "var(--color-white)", zIndex: 1,
        }}>
          {/* Navigation: prev / counter / next */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous project"
              style={{
                width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--color-border)",
                background: "var(--color-light-gray)", cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: currentIndex === 0 ? 0.3 : 1, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (currentIndex > 0) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-light-gray)"; }}
            >
              ←
            </button>
            <span style={{ fontSize: 13, color: "var(--color-gray-text)", minWidth: 40, textAlign: "center" }}>
              {currentIndex + 1} / {allProjects.length}
            </span>
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={currentIndex === allProjects.length - 1}
              aria-label="Next project"
              style={{
                width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--color-border)",
                background: "var(--color-light-gray)", cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: currentIndex === allProjects.length - 1 ? 0.3 : 1, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (currentIndex < allProjects.length - 1) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-light-gray)"; }}
            >
              →
            </button>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, background: "var(--color-light-gray)",
              border: "none", borderRadius: "50%", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-light-gray)"; }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body: gallery + details */}
        <div className="modal-body-grid">
          {/* Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Embla main image */}
            <div
              ref={emblaRef}
              style={{
                width: "100%", aspectRatio: "16/10", borderRadius: 6, overflow: "hidden",
                background: "linear-gradient(135deg, var(--color-light-gray) 0%, var(--color-border) 100%)",
              }}
            >
              {project.images.length > 0 ? (
                <div style={{ display: "flex", height: "100%" }}>
                  {project.images.map((src, i) => (
                    <div key={i} style={{ flex: "0 0 100%", minWidth: 0, position: "relative", height: "100%" }}>
                      <Image
                        src={src}
                        alt={`${project.title} screenshot ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="modal-main-img"
                        priority={i === 0}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: "var(--color-gray-text)", opacity: 0.5, letterSpacing: -2 }}>
                    {project.title.split(" ").map((w) => w[0]).join("").slice(0, 3)}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip with navigation */}
            {project.images.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Left arrow */}
                <button
                  onClick={() => setThumbOffset((o) => o - 1)}
                  disabled={!canThumbPrev}
                  aria-label="Previous thumbnails"
                  style={navBtn({ opacity: canThumbPrev ? 1 : 0.25, cursor: canThumbPrev ? "pointer" : "default" })}
                  onMouseEnter={(e) => { if (canThumbPrev) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-light-gray)"; }}
                >
                  ←
                </button>

                {/* Visible thumbnails */}
                <div style={{ display: "flex", gap: 8, flex: 1 }}>
                  {thumbImages.map((src, i) => {
                    const globalIndex = thumbOffset + i;
                    return (
                      <div
                        key={globalIndex}
                        onClick={() => { emblaApi?.scrollTo(globalIndex); setSelectedImage(globalIndex); }}
                        style={{
                          flex: "1 1 0", height: 40, borderRadius: 4, overflow: "hidden", cursor: "pointer",
                          border: globalIndex === selectedImage ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
                          transition: "border-color 0.15s", position: "relative",
                        }}
                      >
                        <Image src={src} alt={`${project.title} thumbnail ${globalIndex + 1}`} fill sizes="80px" className="modal-thumb-img" />
                      </div>
                    );
                  })}
                  {/* Fill empty slots when fewer than THUMB_VISIBLE images are visible */}
                  {thumbImages.length < THUMB_VISIBLE && Array.from({ length: THUMB_VISIBLE - thumbImages.length }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ flex: "1 1 0", height: 40 }} />
                  ))}
                </div>

                {/* Right arrow */}
                <button
                  onClick={() => setThumbOffset((o) => o + 1)}
                  disabled={!canThumbNext}
                  aria-label="Next thumbnails"
                  style={navBtn({ opacity: canThumbNext ? 1 : 0.25, cursor: canThumbNext ? "pointer" : "default" })}
                  onMouseEnter={(e) => { if (canThumbNext) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-light-gray)"; }}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 4 }}>{project.title}</h2>
            <p style={{ fontSize: 13, color: "var(--color-gray-text)", marginBottom: 16 }}>
              {formatProjectDate(project.year, project.month)}
            </p>
            <div className="tag-list" style={{ marginBottom: 24 }}>
              {project.tech.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text)" }}>
                {project.shortDescription}
              </p>
            </div>

            {[
              { label: "The problem", text: project.problem },
              { label: "Approach", text: project.approach },
              { label: "My role", text: project.role },
            ].map(({ label, text }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--color-gray-text)", marginBottom: 4 }}>
                  {label}
                </h4>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text)" }}>{text}</p>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              {hasDemo && (
                <a href={project.demoUrl!} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Live Demo
                </a>
              )}
              {hasGithub && (
                <a href={project.githubUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
