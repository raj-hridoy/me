import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url).pathname;
const output = root + ".qa/refinement/final/";
await mkdir(output, { recursive: true });
const launch = () =>
  chromium.launch({
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
const evidence = [];
for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  const browser = await launch();
  try {
    const page = await browser.newPage({
      viewport: { width, height: width < 640 ? 844 : 1000 },
      reducedMotion: "reduce",
    });
    await page.goto("http://localhost:3000/me/");
    await page.evaluate(() => document.fonts.ready);
    await page
      .getByRole("button", { name: "Inspect identity layer" })
      .waitFor();
    await page.screenshot({ path: output + `home-${width}-viewport.png` });
    if ([390, 1440].includes(width)) {
      await page
        .locator(".about-preview")
        .screenshot({ path: output + `identity-${width}.png` });
      await page
        .getByRole("button", { name: "Inspect resource layer" })
        .click();
      await page
        .getByRole("button", { name: "Reveal the cross-section" })
        .click();
      await page.locator(".opening-scene").scrollIntoViewIfNeeded();
      await page.screenshot({ path: output + `resource-section-${width}.png` });
      for (const slug of [
        "authorization-boundaries",
        "oauth-redirect-validation",
        "security-critical-code-review",
      ]) {
        await page.goto("http://localhost:3000/me/research/" + slug);
        await page
          .locator("#article-body")
          .screenshot({ path: output + `${slug}-body-${width}.png` });
      }
      await page.goto("http://localhost:3000/me/missing-boundary");
      await page.screenshot({ path: output + `404-${width}.png` });
      if (width === 390) {
        await page.goto("http://localhost:3000/me/");
        await page.getByRole("button", { name: "Open navigation" }).click();
        await page.screenshot({ path: output + "mobile-navigation.png" });
      }
    }
    evidence.push({
      width,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  } finally {
    await browser.close();
  }
}

const browser = await launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  await page.goto("http://localhost:3000/me/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    document.getAnimations().some((a) => a.playState === "running"),
  );
  for (const delay of [0, 220, 500, 700]) {
    await page.waitForTimeout(delay);
    const frame = await page.evaluate(() => ({
      time: performance.now(),
      animations: document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => ({
          progress: a.effect?.getComputedTiming().progress,
          target: a.effect?.target?.className,
        })),
    }));
    evidence.push(frame);
    await page.screenshot({ path: output + `motion-${delay}.png` });
  }
  await page.mouse.move(300, 350);
  await page.waitForTimeout(100);
  evidence.push({
    light: await page
      .locator(".opening-scene")
      .evaluate((el) => ({
        x: el.style.getPropertyValue("--light-x"),
        y: el.style.getPropertyValue("--light-y"),
      })),
  });
  await page.getByRole("button", { name: "Explicit sharing grant" }).click();
  await page.getByRole("button", { name: "Send the request" }).click();
  await page.waitForTimeout(700);
  await page
    .locator(".trust-explorer")
    .screenshot({ path: output + "request-trace-mid.png" });
  await page.waitForTimeout(1900);
  await page
    .locator(".trust-explorer")
    .screenshot({ path: output + "request-trace-complete.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  evidence.push({
    reducedMotionRunningAnimations: await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
  });
} finally {
  await browser.close();
}
await writeFile(
  output + "motion-and-layout.json",
  JSON.stringify(evidence, null, 2),
);
console.log(JSON.stringify(evidence));
