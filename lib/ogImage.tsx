import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared Open Graph / Twitter image generator. Both app/opengraph-image.tsx and
// app/twitter-image.tsx re-export from here so the design lives in one place.

export const alt = "Jari Dijk — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1A365D";
const ACCENT = "#3182CE";
const WHITE = "#FFFFFF";
const GRAY_TEXT = "#718096";
const TAG_BG = "rgba(49, 130, 206, 0.08)";
const TAG_BORDER = "rgba(49, 130, 206, 0.2)";
const TAGS = ["Blazor", ".NET", "Unity", "C#"];
const PHOTO_SIZE = 320;

export default async function ogImage() {
  const photo = await readFile(join(process.cwd(), "public/Profile.jpg"), "base64");
  const photoSrc = `data:image/jpeg;base64,${photo}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: WHITE,
          padding: "80px 96px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 3, color: ACCENT, textTransform: "uppercase" }}>
            Full-Stack Developer
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, color: NAVY, marginTop: 12, lineHeight: 1.05 }}>
            Jari Dijk
          </div>
          <div style={{ fontSize: 28, color: GRAY_TEXT, marginTop: 20, lineHeight: 1.4 }}>
            Modern web apps, dashboards &amp; interactive experiences.
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            {TAGS.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: ACCENT,
                  background: TAG_BG,
                  border: `1px solid ${TAG_BORDER}`,
                  borderRadius: 6,
                  padding: "8px 20px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        {/* satori does not clip child images to a parent's border-radius, so the
            circle (and ring) must live on the <img> itself. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          alt="Jari Dijk"
          width={PHOTO_SIZE}
          height={PHOTO_SIZE}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            objectPosition: "55% 35%",
            flexShrink: 0,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
