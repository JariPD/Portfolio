"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/#projects" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        height: "var(--header-height)",
        background: "var(--color-white)",
        zIndex: 100,
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-width)",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-primary)",
            textDecoration: "none",
            letterSpacing: "-0.5px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
        >
          JD
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--color-text)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text)")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side: mobile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Mobile toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open menu"
            style={{
              display: "none",
              flexDirection: "column", justifyContent: "center",
              gap: 5, width: 40, height: 40,
              background: "none", border: "none", cursor: "pointer", padding: 4,
            }}
          >
            <span style={{ display: "block", height: 2, background: "var(--color-text)", borderRadius: 2, transition: "transform 0.2s, opacity 0.2s", transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", height: 2, background: "var(--color-text)", borderRadius: 2, transition: "opacity 0.2s", opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ display: "block", height: 2, background: "var(--color-text)", borderRadius: 2, transition: "transform 0.2s", transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div
          className="mobile-nav"
          style={{
            position: "fixed", top: "var(--header-height)", left: 0, right: 0,
            background: "var(--color-white)",
            borderBottom: "1px solid var(--color-border)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 99, padding: "8px 24px",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", padding: "12px 0",
                fontSize: 15, fontWeight: 500, color: "var(--color-text)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

    </header>
  );
}
