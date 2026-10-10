import { test as base } from "@playwright/test";
// The document portal needs single-process Chromium. Give each test a fresh
// browser because that mode cannot safely reuse isolated contexts.
export const test =
  process.env.CODEX_PORTAL_WORKAROUND === "1"
    ? base.extend({
        context: async (
          {
            playwright,
            launchOptions,
            baseURL,
            viewport,
            hasTouch,
            isMobile,
            reducedMotion,
            colorScheme,
          },
          provideContext,
        ) => {
          const browser = await playwright.chromium.launch(launchOptions);
          const context = await browser.newContext({
            baseURL,
            viewport,
            hasTouch,
            isMobile,
            reducedMotion,
            colorScheme,
          });
          await provideContext(context);
          await browser.close();
        },
      })
    : base;
export { expect } from "@playwright/test";
