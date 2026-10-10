import { sitePath } from "./site-path";
import { test as base, expect } from "./fixtures";
import soundtrack from "../src/data/soundtrack.json";
import { audioAssetPath } from "../src/lib/soundtrack-controller";

declare global {
  interface Window {
    __audioAttempts: { inGesture: boolean; active: boolean; time: number }[];
    __sharedAudio: HTMLAudioElement;
  }
}
const test = base.extend<{ audioPolicy: string }>({
  audioPolicy: ["document-user-activation-required", { option: true }],
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
      audioPolicy,
    },
    provideContext,
  ) => {
    const browser = await playwright.chromium.launch({
      ...launchOptions,
      // Headless hardware muting makes Chromium permit otherwise blocked audio.
      ignoreDefaultArgs: ["--mute-audio"],
      args: [...(launchOptions.args ?? []), `--autoplay-policy=${audioPolicy}`],
    });
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
});
// Chromium DevTools evaluations used by tracing can grant transient activation
// before hydration; observe native autoplay without that instrumentation.
test.use({ trace: "off" });
const logPlayback = async (page: import("@playwright/test").Page) => {
  await page.addInitScript(() => {
    window.__audioAttempts = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.__audioAttempts.push({
        inGesture: Boolean(
          window.event?.isTrusted &&
          [
            "pointerdown",
            "pointerup",
            "touchstart",
            "touchend",
            "click",
            "keydown",
            "wheel",
            "scroll",
          ].includes(window.event.type),
        ),
        active: navigator.userActivation?.isActive ?? false,
        time: performance.now(),
      });
      return play.call(this);
    };
  });
};
const control = (page: import("@playwright/test").Page) =>
  page.locator("[data-audio-control]");
const media = (page: import("@playwright/test").Page) =>
  page.locator("audio[data-soundtrack]");

test("soundtrack assets use subpath-safe URLs and support progressive ranges with durable caching", async ({
  request,
}) => {
  expect(audioAssetPath(soundtrack.opus, "/me/")).toBe(
    `/me/audio/${soundtrack.opus}`,
  );
  for (const file of Object.values(soundtrack)) {
    const response = await request.get(sitePath(`/audio/${file}`), {
      headers: { Range: "bytes=0-4095" },
    });
    expect(response.status()).toBe(206);
    expect(response.headers()["content-range"]).toMatch(/^bytes 0-4095\//);
    expect(response.headers()["accept-ranges"]).toBe("bytes");
    expect(response.headers()["content-type"]).toMatch(/^audio\//);
    expect(response.headers()["cache-control"]).toContain("immutable");
    expect((await response.body()).length).toBe(4096);
  }
});

test.describe("allowed native audio", () => {
  test.use({ audioPolicy: "no-user-gesture-required" });
  test("immediate native autoplay reaches 100%, loads one codec and loops without a second instance", async ({
    page,
  }) => {
    await logPlayback(page);
    const sources: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/audio/")) sources.push(request.url());
    });
    await page.goto(sitePath("/"));
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await expect
      .poll(() => media(page).evaluate((el) => (el as HTMLAudioElement).volume))
      .toBe(1);
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0.2);
    expect(await page.evaluate(() => window.__audioAttempts)).toHaveLength(1);
    expect(await page.evaluate(() => window.__audioAttempts[0].inGesture)).toBe(
      false,
    );
    expect(new Set(sources.map((s) => new URL(s).pathname))).toEqual(
      new Set([`/me/audio/${soundtrack.opus}`]),
    );
    await expect(media(page)).toHaveCount(1);
    await media(page).evaluate((el) => {
      const audio = el as HTMLAudioElement;
      audio.currentTime = audio.duration - 0.2;
    });
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeLessThan(1);
    expect(
      await media(page).evaluate((el) => (el as HTMLAudioElement).paused),
    ).toBe(false);
    await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  });
  test("manual mute persists through navigation, gestures and reload without fetching audio", async ({
    page,
  }) => {
    await page.goto(sitePath("/"));
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await page.waitForTimeout(500);
    await control(page).click();
    await expect(control(page)).toHaveAttribute("data-phase", "off");
    const stopped = await media(page).evaluate(
      (el) => (el as HTMLAudioElement).currentTime,
    );
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await page.keyboard.press("a");
    expect(
      await media(page).evaluate((el) => (el as HTMLAudioElement).paused),
    ).toBe(true);
    expect(
      await media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
    ).toBe(stopped);
    const requested: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/audio/")) requested.push(r.url());
    });
    await page.reload();
    await expect(control(page)).toBeEnabled();
    await page.keyboard.press("b");
    await expect(control(page)).toHaveAttribute("data-phase", "off");
    expect(requested).toEqual([]);
    expect(await media(page).getAttribute("src")).toBeNull();
    await control(page).click();
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
  });
  test("AAC is chosen before loading when Opus is unsupported", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const supports = HTMLMediaElement.prototype.canPlayType;
      HTMLMediaElement.prototype.canPlayType = function (type) {
        return type.includes("opus") ? "" : supports.call(this, type);
      };
    });
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/audio/")) requests.push(new URL(r.url()).pathname);
    });
    await page.goto(sitePath("/"));
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0.2);
    expect(new Set(requests)).toEqual(new Set([`/me/audio/${soundtrack.aac}`]));
  });
  test("network failure exposes retry and recovers through the manual control", async ({
    page,
  }) => {
    await page.route("**/audio/*", (route) => route.abort("failed"));
    await page.goto(sitePath("/"));
    await expect(control(page)).toHaveAttribute("data-phase", "error");
    await expect(control(page)).toHaveAttribute("aria-pressed", "false");
    await page.unroute("**/audio/*");
    await control(page).click();
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0);
  });
  test("background suspension resumes the existing position and never reactivates a manual mute", async ({
    page,
  }) => {
    await page.goto(sitePath("/"));
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(control(page)).toHaveAttribute("data-phase", "suspended");
    const held = await media(page).evaluate(
      (el) => (el as HTMLAudioElement).currentTime,
    );
    await page.waitForTimeout(250);
    expect(
      await media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
    ).toBe(held);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(held);
    await control(page).click();
    await expect(control(page)).toHaveAttribute("data-phase", "off");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(
      await media(page).evaluate((el) => (el as HTMLAudioElement).paused),
    ).toBe(true);
  });
  test("progressive playback begins over a throttled connection before the full song is buffered", async ({
    page,
    context,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("rh-sound-preference", "off"),
    );
    await page.goto(sitePath("/"));
    await expect(control(page)).toBeEnabled();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 100,
      downloadThroughput: 64000,
      uploadThroughput: 64000,
    });
    await control(page).click();
    await expect(control(page)).toHaveAttribute("data-phase", "playing", {
      timeout: 20000,
    });
    const progress = await media(page).evaluate((el) => {
      const a = el as HTMLAudioElement;
      return {
        duration: a.duration,
        buffered: Array.from(
          { length: a.buffered.length },
          (_, i) => a.buffered.end(i) - a.buffered.start(i),
        ).reduce((sum, duration) => sum + duration, 0),
        paused: a.paused,
      };
    });
    expect(progress.paused).toBe(false);
    expect(progress.buffered).toBeLessThan(progress.duration * 0.8);
    await cdp.detach();
  });
});

test.describe("restricted native autoplay", () => {
  test.use({ audioPolicy: "document-user-activation-required" });
  test("the first navigation click starts playback synchronously and all routes retain the same track", async ({
    page,
  }) => {
    await logPlayback(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(sitePath("/"));
    await page.waitForTimeout(500);
    await expect(control(page)).toHaveAttribute("data-phase", "blocked");
    expect(await page.evaluate(() => window.__audioAttempts.length)).toBe(1);
    await page.evaluate(() => {
      window.__sharedAudio = document.querySelector("audio[data-soundtrack]")!;
    });
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    expect(await page.evaluate(() => window.__audioAttempts[1].inGesture)).toBe(
      true,
    );
    for (const name of ["Research", "Methodology", "Recognition", "Contact"]) {
      const before = await media(page).evaluate(
        (el) => (el as HTMLAudioElement).currentTime,
      );
      if (name === "Contact") await page.locator(".header-contact").click();
      else
        await page
          .getByRole("navigation", { name: "Main navigation" })
          .getByRole("link", { name, exact: true })
          .click();
      await expect(page).toHaveURL(new RegExp(`/${name.toLowerCase()}/?$`));
      expect(
        await page.evaluate(
          () =>
            window.__sharedAudio ===
            document.querySelector("audio[data-soundtrack]"),
        ),
      ).toBe(true);
      expect(
        await media(page).evaluate(
          (el) => (el as HTMLAudioElement).currentTime,
        ),
      ).toBeGreaterThanOrEqual(before);
      await expect(control(page)).toHaveAttribute("aria-pressed", "true");
    }
    expect(await page.evaluate(() => window.__audioAttempts.length)).toBe(2);
    expect(errors).toEqual([]);
  });
  test("a first keyboard interaction starts actual native audio", async ({
    page,
  }) => {
    await logPlayback(page);
    await page.goto(sitePath("/"));
    await page.waitForTimeout(500);
    await expect(control(page)).toHaveAttribute("data-phase", "blocked");
    await page.keyboard.press("a");
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    expect(await page.evaluate(() => window.__audioAttempts[1].inGesture)).toBe(
      true,
    );
  });
  test("a scroll attempt keeps the later click available when scrolling cannot unlock playback", async ({
    page,
  }) => {
    await logPlayback(page);
    await page.goto(sitePath("/"));
    await page.waitForTimeout(500);
    await expect(control(page)).toHaveAttribute("data-phase", "blocked");
    await page.mouse.wheel(0, 100);
    await expect
      .poll(() => page.evaluate(() => window.__audioAttempts.length))
      .toBe(2);
    if ((await control(page).getAttribute("data-phase")) === "blocked") {
      await page
        .locator(".scene-composition")
        .click({ position: { x: 20, y: 20 } });
      await expect(control(page)).toHaveAttribute("data-phase", "playing");
      expect(
        await page.evaluate(() => window.__audioAttempts[2].inGesture),
      ).toBe(true);
    } else {
      await expect(control(page)).toHaveAttribute("data-phase", "playing");
    }
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0);
  });
  test("blocked retries are bounded and synthetic events cannot unlock sound", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__audioAttempts = [];
      HTMLMediaElement.prototype.play = function () {
        window.__audioAttempts.push({
          inGesture: false,
          active: false,
          time: performance.now(),
        });
        return Promise.reject(
          new DOMException("Policy rejection", "NotAllowedError"),
        );
      };
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(sitePath("/"));
    await page.waitForTimeout(500);
    await expect(control(page)).toHaveAttribute("data-phase", "blocked");
    await page.evaluate(() =>
      document.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    expect(await page.evaluate(() => window.__audioAttempts.length)).toBe(1);
    await page.mouse.wheel(0, 100);
    await expect
      .poll(() => page.evaluate(() => window.__audioAttempts.length))
      .toBe(2);
    await page
      .locator(".scene-composition")
      .click({ position: { x: 20, y: 20 } });
    await expect
      .poll(() => page.evaluate(() => window.__audioAttempts.length))
      .toBe(3);
    await page.keyboard.press("a");
    await page.mouse.wheel(0, 100);
    expect(await page.evaluate(() => window.__audioAttempts.length)).toBe(3);
    await expect(control(page)).toHaveAttribute("aria-pressed", "false");
    await control(page).click();
    await expect
      .poll(() => page.evaluate(() => window.__audioAttempts.length))
      .toBe(4);
    expect(errors).toEqual([]);
  });
  test("without a userActivation API, a rejected pointer-down does not consume the click retry", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "userActivation", {
        configurable: true,
        value: undefined,
      });
      const nativePlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        if (window.event?.type !== "click")
          return Promise.reject(
            new DOMException("Requires click", "NotAllowedError"),
          );
        return nativePlay.call(this);
      };
    });
    await page.goto(sitePath("/"));
    await page.waitForTimeout(500);
    await expect(control(page)).toHaveAttribute("data-phase", "blocked");
    await page
      .locator(".scene-composition")
      .click({ position: { x: 20, y: 20 } });
    await expect(control(page)).toHaveAttribute("data-phase", "playing");
    await expect
      .poll(() =>
        media(page).evaluate((el) => (el as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0);
  });
  test.describe("touch audio", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    test("the first touch starts audio and the docked control can stop it", async ({
      page,
    }) => {
      await page.goto(sitePath("/"));
      await page.waitForTimeout(500);
      await expect(control(page)).toHaveAttribute("data-phase", "blocked");
      await page.getByRole("button", { name: "Open navigation" }).tap();
      await expect(control(page)).toHaveAttribute("data-phase", "playing");
      await page.getByRole("button", { name: "Close navigation" }).tap();
      await page.evaluate(() => window.scrollTo(0, 1000));
      await expect(page.locator(".sound-interface")).toHaveAttribute(
        "data-docked",
        "true",
      );
      const bounds = await control(page).boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
      expect(bounds!.y).toBeGreaterThan(700);
      await control(page).tap();
      await expect(control(page)).toHaveAttribute("data-phase", "off");
      await page.keyboard.press("a");
      expect(
        await media(page).evaluate((el) => (el as HTMLAudioElement).paused),
      ).toBe(true);
    });
  });
});
