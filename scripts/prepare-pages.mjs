// Fail the build if the Pages artifact is incomplete or contains root-only asset URLs.
import { readFile, writeFile, stat, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "out");
const cloudflare = process.env.CF_PAGES === "1";
const basePath = cloudflare ? "" : "/me";
const siteOrigin = cloudflare
  ? "https://raj-hridoy.pages.dev"
  : "https://raj-hridoy.github.io";
const sitePrefix = cloudflare ? "" : "/me";

if (cloudflare) {
  const cssDir = resolve(out, "_next/static/css");
  for (const file of await readdir(cssDir)) {
    if (!file.endsWith(".css")) continue;
    const path = resolve(cssDir, file);
    const css = await readFile(path, "utf8");
    await writeFile(path, css.replaceAll("/me/fonts/", "/fonts/"));
  }
}
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
  const badAsset = cloudflare
    ? ["/me/_next/", "/me/fonts/", "/me/social-preview"].some(prefix => html.includes("=" + String.fromCharCode(34) + prefix))
    : ["/_next/", "/fonts/", "/social-preview"].some(prefix => html.includes("=" + String.fromCharCode(34) + prefix));
  if (badAsset) throw Error("Incorrect asset prefix: " + route);
  const canonical = siteOrigin + sitePrefix + "/" + route + (route ? "/" : "");
  if (!html.includes(canonical)) throw Error("Missing canonical URL: " + canonical);
}
for (const file of [
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "social-preview.png",
  "google90d4a5ce39b0a0ad.html",
])
  await stat(resolve(out, file));
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
      basePath,
      routes,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Pages artifact verified: ${routes.length} routes, fonts, SEO; basePath=${basePath || "/"}.`,
);
