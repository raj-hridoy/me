import { sitePath } from "./site-path";
import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
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
test("all public routes render, expose metadata, and have no runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(sitePath(route));
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main h1"), route).toHaveCount(1);
    await expect(
      page.locator('meta[name="description"]'),
      route,
    ).toHaveAttribute("content", /.+/);
    await expect(page).toHaveTitle(/Raj Hridoy/);
  }
  expect(errors).toEqual([]);
});
test("research category controls and linked categories select the correct notes", async ({
  page,
}) => {
  await page.goto(sitePath("/research"));
  await expect(page.locator(".research-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Authentication and Identity", exact: true })
    .click();
  await expect(page.locator(".research-card")).toHaveCount(1);
  await expect(page.locator(".research-card")).toContainText("redirect");
  await page.getByRole("button", { name: "All research", exact: true }).click();
  await expect(page.locator(".research-card")).toHaveCount(3);
  await page.goto(sitePath("/research?category=Source-Code%20Analysis"));
  await expect(page.locator(".research-card")).toHaveCount(1);
  await expect(page.locator(".research-card")).toContainText("Follow the data");
  await page.goto(sitePath("/research?category=unknown"));
  await expect(page.locator(".research-card")).toHaveCount(3);
});
test("trust explorer responds to keyboard and actual policy changes", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  const tab = page.getByRole("tab", { name: /03 Authorization/ });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel")).toContainText(
    "What can this context reach?",
  );
  await page.keyboard.press("Home");
  await expect(page.getByRole("tabpanel")).toContainText(
    "What is being asked?",
  );
  await page.keyboard.press("End");
  await expect(page.getByRole("tabpanel")).toContainText(
    "What should leave the system?",
  );
  const toggle = page.getByRole("button", { name: "Explicit sharing grant" });
  await expect(page.locator(".policy-outcome")).toContainText("DENY");
  await toggle.click();
  await expect(page.locator(".policy-outcome")).toContainText("PERMIT");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator(".policy-outcome")).toContainText("DENY");
});
test("methodology steps expose the appropriate phase", async ({ page }) => {
  await page.goto(sitePath("/methodology"));
  await page.getByRole("button", { name: /06 Disclose/ }).click();
  await expect(
    page.locator(".methodology-panels section:visible"),
  ).toContainText("explicit approval");
  await expect(
    page.getByRole("button", { name: /06 Disclose/ }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: /03 Validate/ }).click();
  await expect(
    page.locator(".methodology-panels section:visible"),
  ).toContainText("controlled accounts");
});
test("boundary instrument supports keyboard separation and cross-section inspection", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  const range = page.getByRole("slider", { name: "Boundary separation" });
  await expect(range).toBeEnabled();
  await expect(range).toHaveValue("22");
  const before = await page
    .locator(".instrument-art .sculpture-rings path")
    .first()
    .getAttribute("d");
  await range.focus();
  await page.keyboard.press("End");
  await expect(range).toHaveValue("100");
  await expect
    .poll(() =>
      page
        .locator(".instrument-art .sculpture-rings path")
        .first()
        .getAttribute("d"),
    )
    .not.toBe(before);
  await page.getByRole("button", { name: "Reveal the cross-section" }).click();
  await expect(
    page.getByRole("button", { name: "Restore the surface" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".instrument-art clipPath rect")).toHaveAttribute(
    "height",
    "302",
  );
  await page.getByRole("button", { name: "Rotate right" }).click();
  await expect(page.getByLabel("Sculpture rotation")).toHaveText("030°");
  await expect(page.locator(".instrument-art > svg")).toHaveAttribute(
    "data-motion",
    "settled",
  );
  const art = await page.locator(".instrument-art").boundingBox();
  if (!art) throw new Error("Missing sculpture interaction surface");
  // Drag the drawing surface; its center is now a separate native inspection node.
  await page.mouse.move(art.x + art.width / 4, art.y + art.height / 2);
  await page.mouse.down();
  await page.mouse.move(art.x + art.width / 4 + 100, art.y + art.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.getByLabel("Sculpture rotation")).toHaveText("090°");
});
test("request experiment enforces identity and policy before resource access", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  const caller = page.getByRole("combobox", { name: "01 / Caller context" });
  const send = page.getByRole("button", { name: "Send the request" });
  const completion = page.locator(".request-completion");
  await send.click();
  await expect(completion).toContainText("authorization");
  await expect(page.locator(".policy-outcome")).toContainText("DENY");
  await page.getByRole("button", { name: "Explicit sharing grant" }).click();
  await send.click();
  await expect(completion).toContainText("Shared read allowed");
  await caller.selectOption("anonymous");
  await send.click();
  await expect(completion).toContainText("authentication");
  await expect(page.locator(".policy-outcome")).toContainText("DENY");
  await caller.selectOption("owner");
  await send.click();
  await expect(completion).toContainText("Owner read allowed");
  await expect(page.locator(".policy-outcome")).toContainText("PERMIT");
  // Also exercise the real timed trace, including input cancellation.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await send.click();
  await expect(
    page.getByRole("button", { name: "Following the request…" }),
  ).toBeDisabled();
  await caller.selectOption("shared");
  await expect(send).toBeEnabled();
  await send.click();
  await expect(completion).toContainText("Shared read allowed", {
    timeout: 5000,
  });
});
test("mobile navigation supports Escape, focus return, and real navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(sitePath("/"));
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await menu.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /Research/ })
    .click();
  await expect(page).toHaveURL(/\/research\/?$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
test("copy email success and fallback provide accessible feedback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(sitePath("/contact"));
  await page.getByRole("button", { name: "Copy email" }).click();
  await expect(page.locator(".copy-feedback")).toHaveText(
    "Email copied to clipboard.",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "rajhridoy404@wearehackerone.com",
  );
  await page.reload();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("blocked")) },
      configurable: true,
    });
  });
  await page.getByRole("button", { name: "Copy email" }).click();
  await expect(page.locator(".copy-feedback")).toContainText(
    "Copy unavailable",
  );
  await expect(
    page.getByRole("link", { name: "Write an email" }),
  ).toHaveAttribute("href", "mailto:rajhridoy404@wearehackerone.com");
});
test("404 and security headers work", async ({ page, request }) => {
  const response = await page.goto(sitePath("/this-page-does-not-exist"));
  expect(response?.status()).toBe(404);
  await expect(page.locator("main h1")).toContainText("This path");
  const home = await request.get(sitePath("/"));
  expect(await home.text()).toContain('http-equiv="Content-Security-Policy"');
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(await home.text()).toContain("object-src &#x27;none&#x27;");
  expect((await request.get(sitePath("/robots.txt"))).status()).toBe(200);
  expect((await request.get(sitePath("/sitemap.xml"))).status()).toBe(200);
  expect((await request.get(sitePath("/social-preview.png"))).status()).toBe(
    200,
  );
});
test("all internal links have valid destinations", async ({
  page,
  request,
}) => {
  const links = new Set<string>();
  for (const route of routes) {
    await page.goto(sitePath(route));
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")!)))
      links.add(href.split("#")[0]);
  }
  for (const link of links)
    expect((await request.get(sitePath(link))).status(), link).toBe(200);
});
for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test(`home layout and screenshot at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 1000 });
    await page.goto(sitePath("/"));
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "horizontal overflow",
    ).toBe(true);
    await mkdir(".qa/screenshots", { recursive: true });
    await page.screenshot({
      path: `.qa/screenshots/home-${width}.png`,
      fullPage: true,
    });
  });
}
for (const width of [390, 1440]) {
  test(`all page layouts and WCAG automated checks at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mkdir(".qa/screenshots", { recursive: true });
    for (const route of routes) {
      await page.goto(sitePath(route));
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        route,
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations,
        `${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
      await page.screenshot({
        path: `.qa/screenshots/${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.png`,
        fullPage: true,
      });
    }
  });
}
test("content remains available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(sitePath("http://127.0.0.1:3000/"));
  await expect(page.locator("main h1")).toContainText(/I explore/i);
  await expect(page.locator(".research-card")).toHaveCount(3);
  await page.goto(
    sitePath("http://127.0.0.1:3000/me/research/authorization-boundaries"),
  );
  await expect(page.locator("#article-body")).toContainText(
    "Model the decision",
  );
  await context.close();
});

test("architectural layers expose context and motion respects changed preferences", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const plane = page.locator(".instrument-art .sculpture-section path").first();
  const policy = await plane.getAttribute("d");
  const identity = page.getByRole("button", { name: "Inspect identity layer" });
  await expect(identity).toBeEnabled();
  await identity.focus();
  await page.keyboard.press("Space");
  await expect(identity).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".instrument-layer-detail")).toHaveText(
    "Identity establishes who is asking.",
  );
  await expect.poll(() => plane.getAttribute("d")).not.toBe(policy);
  await page.getByRole("button", { name: "Inspect resource layer" }).click();
  await expect(page.locator(".instrument-layer-detail")).toContainText(
    "scoped to the decision",
  );
  await page.mouse.move(200, 200);
  await expect
    .poll(() =>
      page
        .locator(".opening-scene")
        .evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--light-x"),
        ),
    )
    .not.toBe("");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".opening-scene")
        .evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--light-x"),
        ),
    )
    .toBe("");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
});

test("dark surfaces and sharp controls remain consistent across every route", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [...routes, "/missing-boundary"]) {
    await page.goto(sitePath(route));
    const issues = await page.evaluate(() => {
      const problems: string[] = [];
      for (const element of document.querySelectorAll(
        "body,header,footer,main section,.mobile-menu,.card-visual,.code-example",
      )) {
        const style = getComputedStyle(element);
        const rgb = style.backgroundColor.match(/[\d.]+/g)?.map(Number);
        if (rgb && (rgb[3] ?? 1) > 0.9 && Math.max(...rgb.slice(0, 3)) > 80)
          problems.push(
            `${element.className}: bright ${style.backgroundColor}`,
          );
      }
      for (const element of document.querySelectorAll(
        "button,select,.card-visual,.switch,.brand-mark",
      )) {
        if (getComputedStyle(element).borderTopLeftRadius !== "0px")
          problems.push(`${element.className}: rounded`);
      }
      if (getComputedStyle(document.documentElement).colorScheme !== "dark")
        problems.push("Wrong browser color scheme");
      if (document.querySelector("main svg circle,main svg ellipse"))
        problems.push("Curved decorative geometry");
      return problems;
    });
    expect(issues, route).toEqual([]);
  }
  const favicon = await request.get(sitePath("/icon.svg"));
  expect(await favicon.text()).not.toMatch(/rx=|#a6dfcf/);
});

test.describe("touch architecture", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  test("layer inspection and separation work through native touch controls", async ({
    page,
  }) => {
    await page.goto(sitePath("/"));
    const resource = page.getByRole("button", {
      name: "Inspect resource layer",
    });
    await resource.tap();
    await expect(resource).toHaveAttribute("aria-pressed", "true");
    const range = page.getByRole("slider", { name: "Boundary separation" });
    await range.scrollIntoViewIfNeeded();
    const box = await range.boundingBox();
    if (!box) throw new Error("Missing touch slider");
    await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
    expect(Number(await range.inputValue())).toBeGreaterThan(60);
    await page.getByRole("button", { name: "Reveal the cross-section" }).tap();
    await expect(
      page.getByRole("button", { name: "Restore the surface" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
