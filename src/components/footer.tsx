import Link from "next/link";
import { site, navigation } from "@/data/site";
import { Arrow, Mark } from "./icons";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link href="/" className="brand">
          <Mark />
          <span>RAJ HRIDOY.</span>
        </Link>
        <p>
          Understanding systems.
          <br />
          Challenging assumptions.
        </p>
        <div className="footer-socials">
          {site.socials.map((item) => (
            <a
              href={item.href}
              key={item.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
              <Arrow diagonal />
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Raj Hridoy</span>
        <nav aria-label="Footer navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact">Contact</Link>
        </nav>
        <span className="eyebrow">Independent. By design.</span>
      </div>
    </footer>
  );
}
