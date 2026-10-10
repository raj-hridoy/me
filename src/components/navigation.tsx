"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { navigation } from "@/data/site";
import { Arrow, Mark } from "./icons";
import { NavigationProgress } from "./navigation-progress";
import { SoundControl } from "./background-audio";
export function Navigation() {
  const path = usePathname().replace(/^\/me(?=\/|$)/, "");
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (event.key === "Tab" && menu.current) {
        const elements = [
          button.current
            ?.closest("header")
            ?.querySelector<HTMLButtonElement>("[data-audio-control]"),
          button.current,
          ...Array.from(menu.current.querySelectorAll<HTMLAnchorElement>("a")),
        ].filter(Boolean) as HTMLElement[];
        if (event.shiftKey && document.activeElement === elements[0]) {
          event.preventDefault();
          elements.at(-1)?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === elements.at(-1)
        ) {
          event.preventDefault();
          elements[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <Link
        href="/"
        className="brand"
        aria-label="Raj Hridoy home"
        onClick={close}
      >
        <Mark />
        <span>
          RAJ HRIDOY<span className="brand-period">.</span>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={path.startsWith(item.href) ? "page" : undefined}
          >
            {item.label}
            <NavigationProgress />
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <SoundControl />
        <Link className="header-contact" href="/contact">
          Let’s talk <Arrow diagonal />
        </Link>
        <button
          ref={button}
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? "Close −" : "Menu +"}
        </button>
      </div>
      <div ref={menu} className="mobile-menu" id="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile navigation">
          {[...navigation, { label: "Contact", href: "/contact" }].map(
            (item, i) => (
              <Link
                key={item.href}
                style={{ "--menu-index": i } as CSSProperties}
                href={item.href}
                onClick={close}
                aria-current={path.startsWith(item.href) ? "page" : undefined}
              >
                <span className="eyebrow">0{i + 1}</span>
                {item.label}
                <Arrow diagonal />
              </Link>
            ),
          )}
        </nav>
        <p className="eyebrow">Independent research / Bangladesh</p>
      </div>
      <noscript>
        <nav className="nojs-nav" aria-label="Navigation without JavaScript">
          {[...navigation, { label: "Contact", href: "/contact" }].map(
            (item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </noscript>
    </header>
  );
}
