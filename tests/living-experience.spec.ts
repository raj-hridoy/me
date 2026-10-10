import { sitePath } from "./site-path";
import { test, expect } from "./fixtures";

test("optical scope adapts to targets and restores native reading, input, selection and keyboard behavior", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  await expect(
    page.getByRole("button", { name: "Inspect identity layer", exact: true }),
  ).toBeEnabled();
  const scope = page.locator(".scope-cursor");
  const native = () =>
    expect(page.locator("html")).not.toHaveAttribute(
      "data-scope-active",
      "true",
    );
  await page
    .locator(".scene-composition")
    .hover({ position: { x: 20, y: 20 } });
  await expect(scope).toHaveAttribute("data-mode", "default");
  await expect(scope).toHaveAttribute("data-visible", "true");
  expect(await scope.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe(
    "none",
  );
  await page.locator(".scene-research").hover();
  await expect(scope).toHaveAttribute("data-mode", "link");
  await page.locator(".section-toggle").hover();
  await expect(scope).toHaveAttribute("data-mode", "button");
  await page.locator(".research-card .card-visual").first().hover();
  await expect(scope).toHaveAttribute("data-mode", "card");
  const visual = page.locator(".card-visual").first();
  expect(
    await visual.evaluate(
      (el) => getComputedStyle(el.querySelector(".note-art")!).transform,
    ),
  ).not.toBe("none");
  await page.locator(".instrument-art").hover();
  await expect(scope).toHaveAttribute("data-mode", "diagram");
  await page.locator(".scene-caption > p").hover();
  await native();
  await page.getByRole("slider").hover();
  await native();
  await page.locator(".scene-caption > p").evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    getSelection()!.removeAllRanges();
    getSelection()!.addRange(range);
  });
  await page
    .locator(".scene-composition")
    .hover({ position: { x: 20, y: 20 } });
  await native();
  await page.evaluate(() => getSelection()!.removeAllRanges());
  await page.locator(".scene-research").hover();
  await expect(page.locator("html")).toHaveAttribute(
    "data-scope-active",
    "true",
  );
  await page.keyboard.press("Tab");
  await native();
  await page.emulateMedia({ forcedColors: "active" });
  await page
    .locator(".scene-composition")
    .hover({ position: { x: 20, y: 20 } });
  await native();
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await page.locator(".scene-research").hover();
  await native();
});

test("cursor animation failure restores the native pointer while the control still works", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  const button = page.getByRole("button", {
    name: "Inspect resource layer",
    exact: true,
  });
  await expect(button).toBeEnabled();
  await button.hover();
  await expect(page.locator("html")).toHaveAttribute(
    "data-scope-active",
    "true",
  );
  await button.evaluate((el) => {
    el.animate = () => {
      throw new Error("Simulated unavailable animation API");
    };
  });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-scope-active",
    "true",
  );
  await page
    .locator(".scene-composition")
    .hover({ position: { x: 20, y: 20 } });
  expect(
    await page.locator("html").evaluate((el) => getComputedStyle(el).cursor),
  ).not.toBe("none");
});

test("architecture transitions remain coherent when interrupted, focused, or reduced", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  const svg = page.locator(".instrument-art > svg");
  const plane = svg.locator('[data-morph="plane"]');
  const identity = page.getByRole("button", {
    name: "Inspect identity layer",
    exact: true,
  });
  await expect(identity).toBeEnabled();
  const initial = await plane.getAttribute("d");
  await identity.click();
  await expect(svg).toHaveAttribute("data-motion", "moving");
  await expect.poll(() => plane.getAttribute("d")).not.toBe(initial);
  await page
    .getByRole("button", { name: "Inspect resource layer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect policy layer", exact: true })
    .click();
  await expect(svg).toHaveAttribute("data-motion", "settled");
  await expect(plane).toHaveAttribute("d", initial!);
  await page
    .getByRole("button", { name: "Focus selected architecture layer" })
    .click();
  await expect(svg).toHaveAttribute("data-motion", "settled");
  expect(await svg.getAttribute("viewBox")).not.toBe("0 0 640 600");
  await page
    .getByRole("button", { name: "Restore architecture overview" })
    .click();
  await expect(svg).toHaveAttribute("viewBox", "0 0 640 600");
  const node = page.getByRole("button", {
    name: "Inspect identity architecture node",
  });
  await node.focus();
  await page.keyboard.press("Space");
  await expect(identity).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(svg).toHaveAttribute("data-motion", "settled");
  await page.getByRole("button", { name: "Reveal the cross-section" }).click();
  await expect(svg.locator("clipPath rect")).toHaveAttribute("height", "302");
});

test("direct request nodes expose real stages and reduced motion settles a running trace", async ({
  page,
}) => {
  await page.goto(sitePath("/"));
  await page
    .locator(".request-visual")
    .getByRole("button", { name: "Inspect authentication node" })
    .click();
  await expect(page.getByRole("tabpanel")).toContainText("Who is asking?");
  await expect(
    page.getByRole("tab", { name: "02 Authentication" }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Explicit sharing grant" }).click();
  await page.getByRole("button", { name: "Send the request" }).click();
  await expect(
    page.getByRole("button", { name: "Following the request…" }),
  ).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Send the request" }),
  ).toBeEnabled();
  await expect(page.getByRole("tabpanel")).toContainText(
    "What should leave the system?",
  );
  await expect(page.locator(".request-completion")).toContainText(
    "Shared read allowed",
  );
});

test.describe("living touch experience", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  test("touch inspection works without displaying a desktop scope", async ({
    page,
  }) => {
    await page.goto(sitePath("/"));
    const identity = page.getByRole("button", {
      name: "Inspect identity architecture node",
    });
    await expect(identity).toBeEnabled();
    await identity.tap();
    await expect(identity).toHaveAttribute("aria-pressed", "true");
    await page
      .getByRole("button", { name: "Focus selected architecture layer" })
      .tap();
    await expect(page.locator(".boundary-instrument")).toHaveAttribute(
      "data-view",
      "focused",
    );
    await page
      .locator(".request-mobile-visual")
      .getByRole("button", { name: "Inspect resource access node" })
      .tap();
    await expect(page.getByRole("tabpanel")).toContainText(
      "What can this context reach?",
    );
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-scope-active",
      "true",
    );
    expect(
      await page
        .locator(".scope-cursor")
        .evaluate((el) => getComputedStyle(el).display),
    ).toBe("none");
  });
});
