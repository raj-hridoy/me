import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url).pathname;
const routes = [
  "/",
  "/about",
  "/research",
  "/methodology",
  "/recognition",
  "/contact",
  "/research/authorization-boundaries",
  "/research/oauth-redirect-validation",
  "/research/security-critical-code-review",
];
const findings = [];
for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  const browser = await chromium.launch({
    executablePath:
      root +
      ".qa/browser/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell",
    args: [
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-gpu",
      "--in-process-gpu",
    ],
  });
  try {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    for (const route of routes) {
      await page.goto("http://localhost:3000/me" + route, { timeout: 120000 });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        offenders: Array.from(
          document.querySelectorAll(
            "main h1, main h2, main h3, main p, main button, main select",
          ),
        )
          .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
          .map((el) => ({
            tag: el.tagName,
            class: el.className,
            text: el.textContent.slice(0, 65),
            right: el.getBoundingClientRect().right,
          })),
      }));
      findings.push({ width, route, ...result });
      if (result.overflow || result.offenders.length)
        console.log(JSON.stringify({ width, route, ...result }));
    }
    console.log("Checked nine routes at " + width + "px");
  } finally {
    await browser.close();
  }
}
await writeFile(
  root + ".qa/deployment/layout-audit.json",
  JSON.stringify(findings, null, 2),
);
if (findings.some((f) => f.overflow || f.offenders.length))
  process.exitCode = 1;
else console.log("54 route/viewport checks passed.");
