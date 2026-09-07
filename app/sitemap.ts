import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/terms-of-service", "/privacy-policy"];

  return routes.map((route) => ({
    url: `https://consumel.com${route}`,
    lastModified: new Date("2026-09-06"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
