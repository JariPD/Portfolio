"use client";

import { useEffect, useRef } from "react";

// Self-hosted video slide. Autoplay clips stay muted + inline (browser policy) and
// only play while their slide is active; everything pauses when scrolled away.
export default function MediaVideo({
  src,
  poster,
  alt,
  loop = false,
  autoPlay = false,
  isActive,
}: {
  src: string;
  poster: string;
  alt?: string;
  loop?: boolean;
  autoPlay?: boolean;
  isActive: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (isActive) {
      if (autoPlay) video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, autoPlay]);

  return (
    <video
      ref={ref}
      poster={poster}
      controls={!autoPlay}
      muted={autoPlay}
      loop={loop}
      playsInline
      preload="none"
      aria-label={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000", display: "block" }}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
