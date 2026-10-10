import { chromium, firefox, webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url).pathname;
const output = root + ".qa/audio/final/";
await mkdir(output, { recursive: true });
const results = [];
const mode = process.argv[2] ?? "visual";
const executablePath =
  root +
  ".qa/browser/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumArgs = [
  "--no-sandbox",
  "--single-process",
  "--no-zygote",
  "--disable-gpu",
  "--in-process-gpu",
  "--autoplay-policy=document-user-activation-required",
];
if (mode === "visual") {
  for (const width of [360, 390, 800, 1024, 1440]) {
    const browser = await chromium.launch({
      executablePath,
      args: chromiumArgs,
      ignoreDefaultArgs: ["--mute-audio"],
    });
    try {
      const page = await browser.newPage({
        viewport: { width, height: width < 800 ? 844 : 1000 },
        hasTouch: width < 800,
        isMobile: width < 800,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://localhost:3000/me/");
      await page.waitForTimeout(800);
      const state = async () =>
        page.evaluate(() => {
          const audio = document.querySelector("audio[data-soundtrack]");
          const button = document.querySelector("[data-audio-control]");
          const bounds = button.getBoundingClientRect();
          return {
            phase: button.dataset.phase,
            label: button.textContent,
            paused: audio.paused,
            volume: audio.volume,
            time: audio.currentTime,
            source: audio.currentSrc,
            count: document.querySelectorAll("audio[data-soundtrack]").length,
            bounds: {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
            },
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
      const initial = await state();
      await page.screenshot({ path: output + `${width}-ready.png` });
      if (width < 800)
        await page
          .locator(".scene-composition")
          .tap({ position: { x: 20, y: 20 } });
      else await page.keyboard.press("a");
      await page
        .locator('[data-audio-control][data-phase="playing"]')
        .waitFor();
      await page.waitForTimeout(600);
      const playing = await state();
      await page.screenshot({ path: output + `${width}-playing.png` });
      // Count only a settled interval after the finite entrance/audio fades.
      await page.waitForTimeout(1200);
      await page.evaluate(() => {
        window.__audioIdleFrames = 0;
        const frame = window.requestAnimationFrame;
        window.requestAnimationFrame = (callback) => {
          window.__audioIdleFrames++;
          return frame.call(window, callback);
        };
      });
      await page.waitForTimeout(1000);
      const idleFrames = await page.evaluate(() => window.__audioIdleFrames);
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);
      await page.screenshot({ path: output + `${width}-docked.png` });
      const docked = await state();
      await page.locator("[data-audio-control]").click();
      await page.locator('[data-audio-control][data-phase="off"]').waitFor();
      const off = await state();
      results.push({
        width,
        initial,
        playing,
        docked,
        off,
        idleFrames,
        errors,
      });
      console.log(`Audio states captured at ${width}px`);
    } finally {
      await browser.close();
    }
  }
} else if (mode === "browsers") {
  for (const [name, engine] of [
    ["firefox", firefox],
    ["webkit", webkit],
  ]) {
    let browser;
    try {
      browser = await engine.launch({ headless: true, timeout: 15000 });
      const page = await browser.newPage();
      await page.goto("http://localhost:3000/me/");
      await page.waitForTimeout(1000);
      const initial = await page
        .locator("[data-audio-control]")
        .getAttribute("data-phase");
      await page.keyboard.press("a");
      await page
        .locator('[data-audio-control][data-phase="playing"]')
        .waitFor({ timeout: 10000 });
      await page.waitForTimeout(500);
      const before = await page.locator("audio").evaluate((a) => {
        window.__sameAudio = a;
        return { time: a.currentTime, volume: a.volume, source: a.currentSrc };
      });
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "About", exact: true })
        .click();
      await page.waitForURL("**/about/");
      const after = await page.locator("audio").evaluate((a) => ({
        same: window.__sameAudio === a,
        time: a.currentTime,
        paused: a.paused,
      }));
      results.push({ name, initial, before, after });
    } catch (error) {
      results.push({ name, unavailable: String(error).slice(0, 4000) });
    } finally {
      await browser?.close();
    }
  }
} else throw new Error("Use visual or browsers");
await writeFile(
  output + `${mode}-evidence.json`,
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
