import { PageIntro, SectionLabel, ContactInvitation } from "@/components/ui";
import { recognitions, site } from "@/data/site";
import { Arrow } from "@/components/icons";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Recognition",
  "Independent vulnerability research acknowledgments through the U.S. Department of Defense and Sony disclosure programs.",
  "/recognition",
);
export default function Recognition() {
  return (
    <>
      <PageIntro
        number="04"
        label="Disclosure acknowledgments"
        title="Independent."
        accent="Acknowledged."
        description="Acknowledgments received through vulnerability disclosure programs for independent security research."
      />
      <section className="container recognition-list">
        {recognitions.map((recognition, i) => (
          <article className="recognition-entry" key={recognition.name}>
            <span className="eyebrow">0{i + 1} / Acknowledgment</span>
            <div
              className={`recognition-mark ${i ? "sony" : "dod"}`}
              aria-hidden="true"
            >
              {recognition.mark}
            </div>
            <div>
              <h2>{recognition.name}</h2>
              <p>{recognition.description}</p>
              <span className="eyebrow">
                Responsible vulnerability disclosure
              </span>
            </div>
          </article>
        ))}
        <aside className="recognition-context">
          <SectionLabel number="01">Context matters</SectionLabel>
          <p>
            These acknowledgments relate to independent research submitted
            through disclosure programs. They do not indicate employment,
            sponsorship, partnership, official representation, or organizational
            endorsement. No confidential findings are published here.
          </p>
          <a
            className="text-link"
            href={site.socials[0].href}
            target="_blank"
            rel="noopener noreferrer"
          >
            View my HackerOne profile
            <Arrow diagonal />
          </a>
        </aside>
      </section>
      <ContactInvitation />
    </>
  );
}
