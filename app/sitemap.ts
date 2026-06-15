import type { MetadataRoute } from "next";

const SITE_URL = "https://jaridijk.nl";

// Static routes. If projects get individual pages, map over getAllProjects() here.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
