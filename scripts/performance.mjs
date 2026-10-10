import { chromium } from "playwright";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { mkdir, writeFile } from "node:fs/promises";
const portal = process.env.CODEX_PORTAL_WORKAROUND === "1";
const audioAllowed = process.env.QA_AUDIO_AUTOPLAY === "1";
await mkdir(".qa/performance", { recursive: true });
for (const formFactor of ["desktop", "mobile"]) {
  const browser = await chromium.launch({
    headless: true,
    ...(audioAllowed ? { ignoreDefaultArgs: ["--mute-audio"] } : {}),
    args: [
      "--no-sandbox",
      "--remote-debugging-port=9222",
      ...(audioAllowed ? ["--autoplay-policy=no-user-gesture-required"] : []),
      ...(portal
        ? [
            "--single-process",
            "--no-zygote",
            "--disable-gpu",
            "--in-process-gpu",
          ]
        : []),
    ],
  });
  try {
    const result = await lighthouse(
      process.env.QA_SITE_URL ?? "http://127.0.0.1:3000/me/",
      {
        port: 9222,
        output: ["html", "json"],
        logLevel: "error",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        disableStorageReset: false,
      },
      formFactor === "desktop" ? desktopConfig : undefined,
    );
    if (!result) throw new Error("No Lighthouse report");
    await writeFile(`.qa/performance/${formFactor}.html`, result.report[0]);
    await writeFile(`.qa/performance/${formFactor}.json`, result.report[1]);
    console.log(
      JSON.stringify({
        formFactor,
        audioAllowed,
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [
            key,
            Math.round(value.score * 100),
          ]),
        ),
        metrics: Object.fromEntries(
          [
            "largest-contentful-paint",
            "cumulative-layout-shift",
            "total-blocking-time",
            "first-contentful-paint",
          ].map((key) => [key, result.lhr.audits[key]?.displayValue]),
        ),
        warnings: result.lhr.runWarnings,
      }),
    );
  } finally {
    await browser.close();
  }
}
