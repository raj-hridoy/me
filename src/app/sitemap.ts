export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { siteUrl, absoluteSiteUrl } from "@/lib/metadata";
import { publishedResearch } from "@/data/notes";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  if (!base) return [];
  return [
    "/",
    "/about",
    "/research",
    "/methodology",
    "/recognition",
    "/contact",
    ...publishedResearch.map((n) => `/research/${n.slug}`),
  ].map((path) => ({
    url: absoluteSiteUrl(path.endsWith("/") ? path : `${path}/`),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
