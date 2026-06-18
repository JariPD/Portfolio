import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy. This is a static site that relies on inline styles and Next's
// inline hydration scripts, so 'unsafe-inline' is required (a nonce-based CSP would force
// every page to render dynamically — see node_modules/next/dist/docs CSP guide). The key
// hardening here is `frame-src` (only the video embed hosts) and `frame-ancestors 'none'`.
// 'unsafe-eval' is only added in dev, where React uses eval for richer error overlays.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://img.youtube.com https://i.ytimg.com",
  "font-src 'self'",
  // TEMP: test-videos.co.uk is the sample-clip host for demo placeholders — drop it here
  // (and self-host real clips, covered by 'self') with the rest of the placeholder assets.
  "media-src 'self' blob: https://test-videos.co.uk",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

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
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
