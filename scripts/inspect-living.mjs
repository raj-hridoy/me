import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url).pathname;
const output = root + ".qa/living/" + (process.argv[2] ?? "pass-1") + "/";
await mkdir(output, { recursive: true });
const evidence = [];
for (const width of process.argv[3] ? [Number(process.argv[3])] : [1440, 390]) {
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
      viewport: { width, height: width === 390 ? 844 : 1000 },
      hasTouch: width === 390,
      isMobile: width === 390,
    });
    await page.addInitScript(() => {
      window.__frames = 0;
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = (callback) =>
        raf.call(window, (time) => {
          window.__frames++;
          callback(time);
        });
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:3000/me/");
    await page.evaluate(() => document.fonts.ready);
    await page
      .getByRole("button", { name: "Inspect identity layer", exact: true })
      .waitFor();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: output + `home-${width}.png` });
    if (width === 1440) {
      for (const [name, selector] of [
        ["default", ".scene-composition"],
        ["link", ".scene-research"],
        ["button", ".section-toggle"],
        ["card", ".research-card .card-visual"],
        ["diagram", ".instrument-art"],
      ]) {
        await page
          .locator(selector)
          .first()
          .hover(name === "default" ? { position: { x: 20, y: 20 } } : {});
        await page.waitForTimeout(300);
        await page.screenshot({ path: output + `scope-${name}.png` });
      }
      await page.mouse.move(1439, 990);
      await page.waitForTimeout(100);
      evidence.push({
        width,
        edgeOverflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
    }
    const identity = page.getByRole("button", {
      name: "Inspect identity layer",
      exact: true,
    });
    if (width === 390) await identity.tap();
    else await identity.click();
    await page.waitForTimeout(120);
    await page.screenshot({ path: output + `layer-moving-${width}.png` });
    await page.waitForTimeout(600);
    await page
      .getByRole("button", { name: "Focus selected architecture layer" })
      .click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: output + `layer-focused-${width}.png` });
    await page
      .getByRole("button", { name: "Restore architecture overview" })
      .click();
    await page.getByRole("button", { name: "Explicit sharing grant" }).click();
    await page.getByRole("button", { name: "Send the request" }).click();
    await page.waitForTimeout(650);
    await page.screenshot({ path: output + `trace-moving-${width}.png` });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: output + `trace-complete-${width}.png` });
    const first = await page.evaluate(() => window.__frames);
    await page.waitForTimeout(1000);
    evidence.push({
      width,
      idleFrameCallbacks: (await page.evaluate(() => window.__frames)) - first,
      errors,
    });
    if (width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.waitForTimeout(450);
      await page.screenshot({ path: output + "mobile-menu.png" });
    }
    if (width === 390)
      await page.getByRole("button", { name: "Close navigation" }).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: output + `reduced-${width}.png` });
  } finally {
    await browser.close();
  }
  const archiveBrowser = await chromium.launch({
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
    const archive = await archiveBrowser.newPage({
      viewport: { width, height: width === 390 ? 844 : 1000 },
      hasTouch: width === 390,
      isMobile: width === 390,
    });
    await archive.goto("http://localhost:3000/me/research");
    await archive
      .getByRole("button", { name: "API Security", exact: true })
      .click();
    await archive.waitForTimeout(500);
    await archive.screenshot({ path: output + `filtered-${width}.png` });
  } finally {
    await archiveBrowser.close();
  }
}
await writeFile(
  output + "interaction-evidence.json",
  JSON.stringify(evidence, null, 2),
);
console.log(JSON.stringify(evidence));
