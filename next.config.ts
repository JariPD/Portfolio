import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // YouTube embed poster thumbnails (facade + gallery thumb strip)
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // TEMP: sample video host for demo placeholders — remove with real clips
      { protocol: "https", hostname: "test-videos.co.uk" },
    ],
  },
};

export default nextConfig;
