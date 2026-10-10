import type { Metadata } from "next";
export function siteUrl(): URL | undefined {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL || "https://raj-hridoy.github.io/me/";

  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL");
  return url;
}
export function absoluteSiteUrl(path: string): string {
  const base = siteUrl()!;
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  return new URL(path.replace(/^\//, ""), base).href;
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const base = siteUrl();
  return {
    title,
    description,
    ...(base
      ? {
          alternates: {
            canonical: absoluteSiteUrl(path.endsWith("/") ? path : `${path}/`),
          },
        }
      : {}),
    openGraph: {
      title: `${title} — Raj Hridoy`,
      description,
      type: "website",
      ...(base
        ? {
            url: absoluteSiteUrl(path.endsWith("/") ? path : `${path}/`),
            images: [
              {
                url: absoluteSiteUrl("/social-preview.png"),
                width: 1200,
                height: 630,
                alt: "Raj Hridoy — I explore where trust breaks.",
              },
            ],
          }
        : {}),
    },
  };
}
