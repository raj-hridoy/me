import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    headless: true,
    launchOptions: {
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        ...(process.env.CODEX_PORTAL_WORKAROUND === "1"
          ? [
              "--disable-gpu",
              "--in-process-gpu",
              "--single-process",
              "--no-zygote",
              `--browser-subprocess-path=${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell`,
            ]
          : []),
      ],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      process.env.CODEX_PORTAL_WORKAROUND === "1"
        ? "node scripts/desktop.mjs start"
        : "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
