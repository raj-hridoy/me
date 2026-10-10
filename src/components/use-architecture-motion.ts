"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

const number = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
type Attributes = Map<string, string>;

/** Interpolates only changed SVG coordinates, without React renders or an idle loop. */
export function useArchitectureMotion(
  ref: RefObject<SVGSVGElement | null>,
  desired: Record<string, Record<string, string | number>>,
  immediate: boolean,
) {
  const previous = useRef(new Map<Element, Attributes>());
  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const targets = new Map<Element, Attributes>();
    const transitions: {
      element: Element;
      name: string;
      template: string;
      start: number[];
      end: number[];
    }[] = [];
    for (const element of [svg, ...svg.querySelectorAll("[data-morph]")]) {
      const target =
        desired[
          element === svg ? "svg" : (element.getAttribute("data-morph") ?? "")
        ];
      if (!target) continue;
      const attrs = new Map<string, string>();
      for (const [name, raw] of Object.entries(target)) {
        const value = String(raw);
        attrs.set(name, value);
        const old = previous.current.get(element)?.get(name);
        if (old && old !== value) {
          const start = (old.match(number) ?? []).map(Number),
            end = (value.match(number) ?? []).map(Number);
          if (start.length === end.length && start.length)
            transitions.push({ element, name, template: value, start, end });
        }
      }
      targets.set(element, attrs);
    }
    const bounds = svg.getBoundingClientRect();
    if (
      immediate ||
      media.matches ||
      document.hidden ||
      bounds.bottom < 0 ||
      bounds.top > innerHeight ||
      !transitions.length
    ) {
      for (const [element, attrs] of targets)
        for (const [name, value] of attrs)
          if (element.getAttribute(name) !== value)
            element.setAttribute(name, value);
      previous.current = targets;
      svg.dataset.motion = "settled";
      return;
    }
    let frame = 0,
      startTime = 0;
    let observer: IntersectionObserver | null = null;
    const draw = (progress: number) => {
      const ease = 1 - Math.pow(1 - progress, 3);
      for (const transition of transitions) {
        let index = 0;
        const value = transition.template.replace(number, () => {
          const i = index++;
          return (
            transition.start[i] +
            (transition.end[i] - transition.start[i]) * ease
          ).toFixed(3);
        });
        transition.element.setAttribute(transition.name, value);
        previous.current.get(transition.element)?.set(transition.name, value);
      }
    };
    previous.current = new Map(
      [...targets].map(([el, attrs]) => [el, new Map(attrs)]),
    );
    draw(0);
    svg.dataset.motion = "moving";
    const finish = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      for (const [element, attrs] of targets)
        for (const [name, value] of attrs) element.setAttribute(name, value);
      previous.current = targets;
      svg.dataset.motion = "settled";
    };
    const tick = (time: number) => {
      startTime ||= time;
      const progress = Math.min(1, (time - startTime) / 480);
      draw(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => !entry.isIntersecting)) finish();
    });
    observer.observe(svg);
    const visibility = () => {
      if (document.hidden) finish();
    };
    const preference = () => {
      if (media.matches) finish();
    };
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ref, desired, immediate]);
}
