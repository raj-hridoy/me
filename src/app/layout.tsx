import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./interaction.css";
import "./audio.css";
import { BackgroundAudio } from "@/components/background-audio";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ExperienceMotion } from "@/components/experience-motion";
import { ScopeCursor } from "@/components/scope-cursor";
import { site } from "@/data/site";
import { siteUrl, absoluteSiteUrl } from "@/lib/metadata";
const base = siteUrl();
export const metadata: Metadata = {
  ...(base ? { metadataBase: base, alternates: { canonical: base.href } } : {}),
  title: {
    default: "Raj Hridoy — Independent Security Researcher",
    template: "%s — Raj Hridoy",
  },
  description:
    "Independent security researcher and bug bounty hunter from Bangladesh. Exploring trust boundaries in web applications, APIs, and complex systems.",
  openGraph: {
    title: "Raj Hridoy — I explore where trust breaks.",
    description:
      "Independent security research. A closer look at the invisible boundaries of software.",
    type: "website",
    siteName: "Raj Hridoy",
    ...(base
      ? {
          images: [
            {
              url: absoluteSiteUrl("/social-preview.png"),
              width: 1200,
              height: 630,
              alt: "Raj Hridoy — Independent Security Researcher",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    ...(base ? { images: [absoluteSiteUrl("/social-preview.png")] } : {}),
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  themeColor: "#08090e",
  colorScheme: "dark",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    email: site.email,
    homeLocation: { "@type": "Country", name: site.location },
    sameAs: site.socials.map((s) => s.href),
    ...(base ? { url: base.href } : {}),
  };
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'; object-src 'none'"
          />
        )}
        <link
          rel="preload"
          href="/me/fonts/manrope-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/me/fonts/space-grotesk-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/me/fonts/ibm-plex-mono-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <BackgroundAudio>
          <Navigation />
          <main id="main">{children}</main>
          <ExperienceMotion />
          <ScopeCursor />
          <Footer />
        </BackgroundAudio>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\u003c"),
          }}
        />
      </body>
    </html>
  );
}
