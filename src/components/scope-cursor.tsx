"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Optical feedback is imperative and event-driven: pointer movement never sets React state. */
export function ScopeCursor() {
  const scope = useRef<HTMLDivElement>(null);
  const lock = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => {
    const cursor = scope.current,
      frame = lock.current;
    if (!cursor || !frame) return;
    const root = document.documentElement;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const contrast = matchMedia("(forced-colors: active)");
    const painted = new Set<HTMLElement>();
    const pulses = new Set<Animation>();
    let raf = 0,
      scrollTimer = 0,
      target: HTMLElement | null = null;
    let x = 0,
      y = 0,
      seen = false,
      keyboard = false,
      broken = false,
      mode = "default";
    let eventTarget: Element | null = null,
      scrollTime = 0,
      scrollY = window.scrollY;
    const available = () =>
      !broken &&
      cursor.isConnected &&
      frame.isConnected &&
      fine.matches &&
      !reduced.matches &&
      !contrast.matches &&
      !document.hidden &&
      !document.pointerLockElement;
    function unmark() {
      target?.removeAttribute("data-scope-target");
      target = null;
    }
    function hide() {
      root.removeAttribute("data-scope-active");
      cursor!.removeAttribute("data-visible");
      frame!.removeAttribute("data-visible");
      unmark();
      clearPresence();
    }
    function clearPresence() {
      painted.forEach((el) => {
        for (const name of [
          "--light-x",
          "--light-y",
          "--presence-x",
          "--presence-y",
          "--presence-tilt-x",
          "--presence-tilt-y",
        ])
          el.style.removeProperty(name);
        el.removeAttribute("data-presence");
      });
      painted.clear();
    }
    function paint() {
      raf = 0;
      try {
        if (!available() || !seen || keyboard || !eventTarget) {
          hide();
          return;
        }
        if (
          eventTarget.closest(
            "input,select,textarea,[contenteditable],pre,code,p,.article-body,[data-native-cursor]",
          ) ||
          getSelection()?.type === "Range"
        ) {
          hide();
          return;
        }
        const button = eventTarget.closest<HTMLElement>("button");
        const diagram =
          eventTarget.closest<HTMLElement>(
            ".architecture-node,.diagram-node",
          ) ??
          (button
            ? null
            : eventTarget.closest<HTMLElement>(
                ".instrument-art,.request-visual,.request-mobile-visual,.article-illustration,.boundary-art,.methodology-symbol",
              ));
        const card = eventTarget.closest<HTMLElement>(".research-card");
        const link = eventTarget.closest<HTMLElement>("a");
        const next =
          diagram ||
          (card?.querySelector<HTMLElement>(".card-visual") ?? card) ||
          button ||
          link;
        const nextMode = diagram
          ? "diagram"
          : card
            ? "card"
            : button
              ? "button"
              : link
                ? "link"
                : "default";
        const changed = target !== next || mode !== nextMode;
        if (changed) {
          unmark();
          target = next;
          mode = nextMode;
          target?.setAttribute("data-scope-target", mode);
          cursor!.dataset.mode = mode;
          cursor!.querySelector(".scope-label")!.textContent =
            mode === "diagram"
              ? "INSPECT"
              : mode === "card"
                ? "READ"
                : mode === "link"
                  ? "OPEN"
                  : "";
        }
        // All geometry reads precede writes. Target bounds are measured once per queued frame.
        const bounds = ["button", "card", "diagram"].includes(mode)
          ? target?.getBoundingClientRect()
          : null;
        const surface =
          card?.querySelector<HTMLElement>(".card-visual") ??
          eventTarget.closest<HTMLElement>(
            ".opening-scene,.card-visual,.recognition-mark,.article-illustration,.trust-explorer",
          );
        const surfaceBounds = surface?.getBoundingClientRect();
        cursor!.style.transform = `translate3d(${x}px,${y}px,0)`;
        cursor!.dataset.visible = "true";
        if (bounds && bounds.width && bounds.height) {
          const pad = mode === "button" ? 4 : 7;
          const w = bounds.width + pad * 2,
            h = bounds.height + pad * 2,
            c = mode === "button" ? 8 : 18;
          frame!.style.transform = `translate3d(${bounds.left - pad}px,${bounds.top - pad}px,0)`;
          frame!.style.width = `${w}px`;
          frame!.style.height = `${h}px`;
          frame!.style.setProperty("--scope-height", `${h}px`);
          frame!.querySelector("svg")!.setAttribute("viewBox", `0 0 ${w} ${h}`);
          frame!
            .querySelector("path")!
            .setAttribute(
              "d",
              `M1 ${c}V1H${c}M${w - c} 1H${w - 1}V${c}M${w - 1} ${h - c}V${h - 1}H${w - c}M${c} ${h - 1}H1V${h - c}`,
            );
          frame!.dataset.mode = mode;
          frame!.dataset.visible = "true";
          if (changed && mode !== "button") {
            const scan = frame!.querySelector(".scope-scan")!;
            const animation = scan.animate(
              [
                { transform: "translateY(0)", opacity: 0 },
                { opacity: 0.6, offset: 0.2 },
                {
                  transform: `translateY(${Math.max(0, h - 20)}px)`,
                  opacity: 0,
                },
              ],
              { duration: 720, easing: "cubic-bezier(.2,.7,.2,1)" },
            );
            pulses.add(animation);
            animation.onfinish = () => pulses.delete(animation);
          }
        } else frame!.removeAttribute("data-visible");
        painted.forEach((element) => {
          if (element === surface) return;
          for (const name of [
            "--light-x",
            "--light-y",
            "--presence-x",
            "--presence-y",
            "--presence-tilt-x",
            "--presence-tilt-y",
          ])
            element.style.removeProperty(name);
          element.removeAttribute("data-presence");
          painted.delete(element);
        });
        if (
          surface &&
          surfaceBounds &&
          surfaceBounds.width &&
          surfaceBounds.height
        ) {
          const px = Math.max(
            0,
            Math.min(1, (x - surfaceBounds.left) / surfaceBounds.width),
          );
          const py = Math.max(
            0,
            Math.min(1, (y - surfaceBounds.top) / surfaceBounds.height),
          );
          surface.style.setProperty("--light-x", `${(px * 100).toFixed(1)}%`);
          surface.style.setProperty("--light-y", `${(py * 100).toFixed(1)}%`);
          surface.style.setProperty(
            "--presence-x",
            `${((px - 0.5) * 8).toFixed(1)}px`,
          );
          surface.style.setProperty(
            "--presence-y",
            `${((py - 0.5) * 8).toFixed(1)}px`,
          );
          surface.style.setProperty(
            "--presence-tilt-x",
            `${((px - 0.5) * 4).toFixed(1)}deg`,
          );
          surface.style.setProperty(
            "--presence-tilt-y",
            `${((py - 0.5) * -4).toFixed(1)}deg`,
          );
          surface.dataset.presence = "true";
          painted.add(surface);
        }
        // Native cursor is hidden only after the overlay was successfully painted.
        root.dataset.scopeActive = "true";
      } catch {
        broken = true;
        hide();
        clearPresence();
      }
    }
    function queue() {
      try {
        if (!raf) raf = requestAnimationFrame(paint);
      } catch {
        broken = true;
        hide();
        clearPresence();
      }
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse") {
        seen = false;
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      eventTarget = event.target as Element;
      seen = true;
      keyboard = false;
      queue();
    }
    function scroll() {
      if (!seen || !available()) return;
      const time = performance.now(),
        delta = Math.abs(window.scrollY - scrollY);
      cursor!.style.setProperty(
        "--scope-drift",
        `${Math.min(5, (delta / Math.max(16, time - scrollTime)) * 2).toFixed(1)}px`,
      );
      scrollTime = time;
      scrollY = window.scrollY;
      eventTarget = document.elementFromPoint(x, y);
      queue();
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(
        () => cursor!.style.removeProperty("--scope-drift"),
        160,
      );
    }
    function pulse(event: PointerEvent | KeyboardEvent) {
      try {
        if (reduced.matches || document.hidden) return;
        const element = (event.target as Element).closest<HTMLElement>(
          "button,a",
        );
        if (
          element &&
          !element.matches(":disabled") &&
          !element.classList.contains("research-card")
        ) {
          const animation = element.animate(
            [
              { translate: "0 0" },
              { translate: "0 1px", offset: 0.35 },
              { translate: "0 0" },
            ],
            { duration: 180, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          pulses.add(animation);
          animation.onfinish = () => pulses.delete(animation);
        }
        if (
          event instanceof PointerEvent &&
          available() &&
          cursor!.hasAttribute("data-visible")
        ) {
          const animation = cursor!
            .querySelector(".scope-reticle")!
            .animate(
              [{ scale: "1" }, { scale: ".68", offset: 0.3 }, { scale: "1" }],
              { duration: 240, easing: "cubic-bezier(.2,.7,.2,1)" },
            );
          pulses.add(animation);
          animation.onfinish = () => pulses.delete(animation);
        }
      } catch {
        broken = true;
        hide();
      }
    }
    function key(event: KeyboardEvent) {
      if (["Tab", "Escape", "Enter", " "].includes(event.key)) {
        keyboard = true;
        hide();
      }
      if (event.key === "Enter" || event.key === " ") pulse(event);
    }
    function preference() {
      hide();
      clearPresence();
      pulses.forEach((a) => a.cancel());
      pulses.clear();
      cancelAnimationFrame(raf);
      raf = 0;
    }
    function leave() {
      seen = false;
      hide();
      clearPresence();
    }
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", pulse, { passive: true });
    document.addEventListener("keydown", key);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", preference);
    document.addEventListener("pointerlockchange", preference);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    for (const query of [fine, reduced, contrast])
      query.addEventListener("change", preference);
    return () => {
      preference();
      clearTimeout(scrollTimer);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", pulse);
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", preference);
      document.removeEventListener("pointerlockchange", preference);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      for (const query of [fine, reduced, contrast])
        query.removeEventListener("change", preference);
    };
  }, [path]);
  return (
    <div className="scope-plane" aria-hidden="true">
      <div
        ref={scope}
        className="scope-cursor"
        aria-hidden="true"
        data-mode="default"
      >
        <div className="scope-reticle">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="scope-point" />
        <span className="scope-label" />
      </div>
      <div ref={lock} className="scope-target" aria-hidden="true">
        <svg fill="none">
          <path />
        </svg>
        <span className="scope-scan" />
      </div>
    </div>
  );
}
