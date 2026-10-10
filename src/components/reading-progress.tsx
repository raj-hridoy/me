"use client";
import { useEffect, useRef } from "react";
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const article = document.getElementById("article-body");
        if (!article || !ref.current) return;
        const start = article.getBoundingClientRect().top + window.scrollY;
        const total = Math.max(1, article.offsetHeight - window.innerHeight);
        const progress = Math.min(
          1,
          Math.max(0, (window.scrollY - start) / total),
        );
        ref.current.style.transform = `scaleX(${progress})`;
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="reading-progress" ref={ref} aria-hidden="true" />;
}
