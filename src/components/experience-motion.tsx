"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Coordinated entries, event-driven lighting and bounded scroll motion; no continuous loop. */
export function ExperienceMotion() {
  const path = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const animations: Animation[] = [];
    const ease = "cubic-bezier(.2,.7,.2,1)";
    const enter = (element: Element, delay = 0, distance = 24) => {
      animations.push(
        element.animate(
          [
            {
              transform: `translateY(${distance}px)`,
              clipPath: "inset(0 0 8% 0)",
            },
            { transform: "translateY(0)", clipPath: "inset(0)" },
          ],
          { duration: 900, delay, easing: ease },
        ),
      );
    };
    document
      .querySelectorAll(
        ".scene-prelude, .scene-trust, .scene-breaks, .scene-caption, .page-intro h1, .intro-sidenote",
      )
      .forEach((element, index) =>
        enter(element, index * 70, index === 1 ? 32 : 16),
      );
    const art = document.querySelector<HTMLElement>(".instrument-art");
    if (art)
      animations.push(
        art.animate(
          [
            {
              transform: "translateY(22px) rotate(-3deg)",
              clipPath: "inset(0 0 10% 0)",
            },
            { transform: "translateY(0) rotate(0)", clipPath: "inset(0)" },
          ],
          { duration: 1200, delay: 160, easing: ease },
        ),
      );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          enter(entry.target, 0, 28);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".section-heading, .folio, .principle-grid > div, .recognition-entry, .philosophy h2, .about-preview h2",
      )
      .forEach((element) => observer.observe(element));
    const opening = document.querySelector<HTMLElement>(".opening-scene");
    const fine = window.matchMedia("(pointer: fine) and (min-width: 801px)");
    const scenes = new Set<HTMLElement>();
    const painted = new Set<HTMLElement>();
    let scrollFrame = 0;
    function scroll() {
      if (document.hidden || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const readings = [...scenes].map((scene) => ({
          scene,
          bounds: scene.getBoundingClientRect(),
        }));
        const openingBounds =
          opening && art && fine.matches
            ? opening.getBoundingClientRect()
            : null;
        for (const { scene, bounds } of readings) {
          const progress = Math.max(
            0,
            Math.min(
              1,
              (innerHeight - bounds.top) / (innerHeight + bounds.height),
            ),
          );
          scene.style.setProperty("--scene-progress", progress.toFixed(3));
          scene.style.setProperty(
            "--line-progress",
            Math.min(1, progress * 2).toFixed(3),
          );
          painted.add(scene);
        }
        if (openingBounds && openingBounds.bottom > 0 && art)
          art.style.transform = `translateY(${Math.max(-20, Math.min(0, openingBounds.top * 0.025)).toFixed(1)}px)`;
      });
    }
    const sceneObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) scenes.add(entry.target as HTMLElement);
        else scenes.delete(entry.target as HTMLElement);
      }
      scroll();
    });
    document
      .querySelectorAll<HTMLElement>("main > section")
      .forEach((scene) => sceneObserver.observe(scene));
    const phaseObserver = new MutationObserver(() => {
      const phase = document.querySelector<HTMLElement>(
        ".methodology-panels section:not([hidden])",
      );
      if (phase) phase.dataset.phaseEnter = "true";
    });
    const phases = document.querySelector(".methodology-panels");
    if (phases)
      phaseObserver.observe(phases, {
        subtree: true,
        attributes: true,
        attributeFilter: ["hidden"],
      });
    function navigating(event: MouseEvent) {
      if (
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href);
      if (
        destination.origin !== location.origin ||
        destination.pathname === location.pathname
      )
        return;
      const main = document.querySelector("main");
      if (main)
        animations.push(
          main.animate(
            [{ opacity: 1 }, { opacity: 0.94, offset: 0.5 }, { opacity: 1 }],
            { duration: 220, easing: ease },
          ),
        );
    }
    function cancel() {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      cancelAnimationFrame(scrollFrame);
      sceneObserver.disconnect();
      phaseObserver.disconnect();
      document.removeEventListener("click", navigating, true);
      window.removeEventListener("scroll", scroll);
      painted.forEach((element) => {
        element.style.removeProperty("--scene-progress");
        element.style.removeProperty("--line-progress");
      });
      art?.style.removeProperty("transform");
    }
    document.addEventListener("click", navigating, true);
    window.addEventListener("scroll", scroll, { passive: true });
    preference.addEventListener("change", cancel);
    return () => {
      cancel();
      preference.removeEventListener("change", cancel);
    };
  }, [path]);
  return null;
}
