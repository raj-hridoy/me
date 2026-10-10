import { PageIntro, SectionLabel } from "@/components/ui";
import { CopyEmail } from "@/components/copy-email";
import { site } from "@/data/site";
import { Arrow } from "@/components/icons";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Contact",
  "Contact Raj Hridoy for security research conversations and professional opportunities.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <PageIntro
        number="05"
        label="Open a conversation"
        title="Let’s"
        accent="talk."
        description="For security research conversations, professional opportunities, or a thoughtful technical exchange, reach out directly."
      />
      <section className="container contact-main">
        <div className="contact-email-block">
          <SectionLabel number="01">The direct line</SectionLabel>
          <a className="email-link" href={`mailto:${site.email}`}>
            <span>
              rajhridoy404<span className="muted">@</span>
              <br />
              wearehackerone.com
            </span>
            <Arrow diagonal />
          </a>
          <div className="contact-actions">
            <a className="button button-primary" href={`mailto:${site.email}`}>
              Write an email
              <Arrow diagonal />
            </a>
            <CopyEmail />
          </div>
          <p className="contact-note">
            A real inbox. A direct conversation.
            <br />
            No contact forms or tracking.
          </p>
        </div>
        <aside className="contact-aside">
          <span className="eyebrow">Elsewhere on the web</span>
          {site.socials.map((social, i) => (
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              key={social.label}
            >
              <span className="eyebrow">0{i + 1}</span>
              <span>{social.label}</span>
              <Arrow diagonal />
            </a>
          ))}
          <div className="contact-location">
            <span className="live-dot" />
            <p>
              Based in Bangladesh.
              <br />
              <span className="muted">Connected through research.</span>
            </p>
          </div>
        </aside>
      </section>
      <section className="graphite-section contact-guidance">
        <div className="container">
          <SectionLabel number="02">A useful first message</SectionLabel>
          <h2>
            A little context
            <br />
            goes a long way.
          </h2>
          <p>
            Include what you’re working on, the question you’re exploring, and
            any relevant scope. For vulnerability reports affecting a
            third-party organization, use that organization’s approved
            disclosure channel.
          </p>
        </div>
      </section>
    </>
  );
}
