import { chromium } from "playwright";
const executablePath = new URL(
  "../.qa/browser/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell",
  import.meta.url,
).pathname;
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: [
    "--no-sandbox",
    "--single-process",
    "--no-zygote",
    "--disable-gpu",
    "--in-process-gpu",
  ],
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("http://localhost:3001/", {
    timeout: 120000,
  });
  await page.waitForSelector("main h1");
  if (response.status() !== 200) throw new Error(`Status ${response.status()}`);
  await page.getByRole("button", { name: "Explicit sharing grant" }).click();
  await page.waitForFunction(() =>
    document.querySelector(".policy-outcome")?.textContent.includes("PERMIT"),
  );
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    "Development server: HTTP 200, homepage, hydration, and policy interaction passed.",
  );
} finally {
  await browser.close();
}
