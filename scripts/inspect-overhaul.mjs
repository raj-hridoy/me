import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const root = new URL("../", import.meta.url).pathname;
const folder = process.argv[2] ?? "pass-2";
await mkdir(root + ".qa/overhaul/" + folder, { recursive: true });
const routes = [
  "/",
  "/research",
  "/about",
  "/methodology",
  "/recognition",
  "/contact",
  "/research/authorization-boundaries",
];
for (const width of [390, 1440]) {
  for (const route of routes) {
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
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto("http://localhost:3000/me" + route, {
        timeout: 120000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(500);
      const name =
        (route === "/" ? "home" : route.slice(1).replaceAll("/", "-")) +
        "-" +
        width;
      await page.screenshot({
        path: root + ".qa/overhaul/" + folder + "/" + name + ".png",
        fullPage: true,
      });
      if (route === "/") {
        await page.screenshot({
          path: root + ".qa/overhaul/" + folder + "/" + name + "-viewport.png",
        });
        await page.getByRole("button", { name: "Rotate right" }).click();
        await page
          .getByRole("button", { name: "Reveal the cross-section" })
          .click();
        await page.screenshot({
          path: root + ".qa/overhaul/" + folder + "/" + name + "-section.png",
        });
        await page
          .getByRole("button", { name: "Explicit sharing grant" })
          .click();
        await page.getByRole("button", { name: "Send the request" }).click();
        await page
          .locator(".trust-explorer")
          .screenshot({
            path:
              root + ".qa/overhaul/" + folder + "/experiment-" + width + ".png",
          });
      }
      console.log(
        JSON.stringify({
          route,
          width,
          status: response.status(),
          overflow: await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth,
          ),
          errors,
        }),
      );
    } finally {
      await browser.close();
    }
  }
}
