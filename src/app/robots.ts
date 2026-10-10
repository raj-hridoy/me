export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { siteUrl, absoluteSiteUrl } from "@/lib/metadata";
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(base ? { sitemap: absoluteSiteUrl("/sitemap.xml") } : {}),
  };
}
