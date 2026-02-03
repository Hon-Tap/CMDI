import type { MetadataRoute } from "next";

export const revalidate = 3600; // refresh sitemap hourly

const BASE = "https://www.cmdi-ss.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Keep it simple + reliable: list stable pages you already have
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/donate",
    "/gallery",
    "/news",
    "/partner-with-us",
    "/partners",
    "/programs",
    "/projects",
    "/volunteer",
  ];

  return staticRoutes.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
