import Link from "next/link";
import { Arrow } from "./icons";
export function TextLink({
  href,
  children,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`text-link${light ? " light" : ""}`} href={href}>
      {children}
      <Arrow diagonal />
    </Link>
  );
}
export function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="eyebrow section-label">
      <span className="tiny-square" /> {number} / {children}
    </p>
  );
}
export function PageIntro({
  number,
  label,
  title,
  accent,
  description,
}: {
  number: string;
  label: string;
  title: string;
  accent?: string;
  description: string;
}) {
  return (
    <section className={`page-intro obsidian-section page-intro-${number}`}>
      <div className="container intro-topline">
        <SectionLabel number={number}>{label}</SectionLabel>
        <span className="eyebrow">Raj Hridoy / Boundary studies</span>
      </div>
      <div className="container intro-composition">
        <h1>
          <span>{title}</span>
          {accent && (
            <>
              <br />
              <span className="accent">{accent}</span>
            </>
          )}
        </h1>
        <div className="intro-sidenote">
          <span className="intro-registration" aria-hidden="true">
            ↳
          </span>
          <p className="intro-description">{description}</p>
          <span className="eyebrow">Independent research / Bangladesh</span>
        </div>
      </div>
    </section>
  );
}
export function ContactInvitation() {
  return (
    <section className="contact-invitation deep-section">
      <div className="container">
        <div className="contact-invitation-top">
          <SectionLabel number="↗">Open a conversation</SectionLabel>
          <span className="eyebrow">
            Good questions make better conversations.
          </span>
        </div>
        <Link href="/contact" className="contact-heading">
          Let’s look
          <br />
          <span>closer.</span>
          <Arrow diagonal />
        </Link>
        <div className="contact-caption">
          <p>
            Have a security question or a research opportunity?
            <br />
            Let’s start with a conversation.
          </p>
          <TextLink href="/contact">Get in touch</TextLink>
        </div>
      </div>
    </section>
  );
}
