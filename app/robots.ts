import type { MetadataRoute } from "next";

// DEMO PHASE: site still shows placeholder data, so block all crawlers to keep Google from indexing/caching unfinished content.
// AT LAUNCH: switch `disallow` to `allow: "/"` and uncomment the `sitemap` line below.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    // sitemap: "https://jaridijk.nl/sitemap.xml",
  };
}
