"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { mediaThumb, type MediaItem } from "@/lib/projects";

type EmbedItem = Extract<MediaItem, { type: "embed" }>;

// Click-to-load facade for external video. Avoids loading the platform's heavy
// player JS until the user actually plays. Leaving the slide unloads the iframe,
// which stops playback. Uses youtube-nocookie for fewer tracking cookies.
export default function MediaEmbed({
  item,
  isActive,
}: {
  item: EmbedItem;
  isActive: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Reset to the poster when this slide is no longer active so the iframe unmounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isActive) setLoaded(false);
  }, [isActive]);

  // The facade already captured a user click, but browsers (notably Safari/mobile) drop
  // that gesture through iframe creation, so unmuted autoplay stalls on a black control
  // bar. Autoplay MUTED instead — plays instantly everywhere; controls let the user unmute.
  const embedSrc =
    item.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&mute=1&playsinline=1&rel=0`
      : `https://player.vimeo.com/video/${item.id}?autoplay=1&muted=1&playsinline=1&autopause=0&dnt=1`;
  const thumb = mediaThumb(item);
  const label = item.title ?? "video";

  if (loaded) {
    return (
      <iframe
        src={embedSrc}
        title={item.title ?? "Video player"}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    );
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      aria-label={`Play ${label}`}
      style={{
        width: "100%", height: "100%", padding: 0, border: 0, cursor: "pointer",
        position: "relative", background: "transparent", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {thumb && (
        <Image src={thumb} alt={item.title ?? "Video thumbnail"} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
      )}
      <span
        aria-hidden="true"
        style={{
          position: "relative", width: 64, height: 64, borderRadius: "50%",
          background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 24,
          display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 4,
        }}
      >
        ▶
      </span>
    </button>
  );
}
