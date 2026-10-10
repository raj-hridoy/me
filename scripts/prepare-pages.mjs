// Fail the build if the Pages artifact is incomplete or contains root-only asset URLs.
import { readFile, writeFile, stat, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "out");
const routes = [
  "",
  "about",
  "research",
  "methodology",
  "recognition",
  "contact",
  "research/authorization-boundaries",
  "research/oauth-redirect-validation",
  "research/security-critical-code-review",
];
for (const route of routes) {
  const html = await readFile(resolve(out, route, "index.html"), "utf8");
  if (!html.includes('http-equiv="Content-Security-Policy"'))
    throw new Error(`Missing static CSP: ${route}`);
  if (
    /(?:src|href)="\/(?:_next|fonts|audio|social-preview)(?:\/|\.)/.test(html)
  )
    throw new Error(`Unprefixed asset: ${route}`);
  if (
    !html.includes(
      `https://raj-hridoy.github.io/me/${route}${route ? "/" : ""}`,
    )
  )
    throw new Error(`Missing project canonical: ${route}`);
}
for (const file of [
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "social-preview.png",
  "google90d4a5ce39b0a0ad.html",
])
  await stat(resolve(out, file));
const soundtrack = JSON.parse(
  await readFile(resolve(root, "src/data/soundtrack.json"), "utf8"),
);
for (const file of [soundtrack.opus, soundtrack.aac])
  await stat(resolve(out, "audio", file));
const fonts = await readdir(resolve(out, "fonts"));
if (fonts.filter((f) => f.endsWith(".woff2")).length < 3)
  throw new Error("Fonts missing");
await writeFile(resolve(out, ".nojekyll"), "");
await writeFile(
  resolve(out, "deployment.json"),
  JSON.stringify(
    {
      repository: "raj-hridoy/me",
      commit: process.env.GITHUB_SHA ?? "local-preview",
      basePath: "/me",
      routes,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Pages artifact verified: ${routes.length} routes, fonts, SEO, both audio codecs, /me paths.`,
);
