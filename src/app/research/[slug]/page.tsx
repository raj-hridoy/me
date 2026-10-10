import Link from "next/link";
import { notFound } from "next/navigation";
import { notes, publishedResearch } from "@/data/notes";
import { NoteArt } from "@/components/note-art";
import { ResearchCard } from "@/components/research-card";
import { ReadingProgress } from "@/components/reading-progress";
import { SectionLabel } from "@/components/ui";
import { Arrow } from "@/components/icons";
import { pageMetadata } from "@/lib/metadata";
export const dynamicParams = false;
export function generateStaticParams() {
  return publishedResearch.map((note) => ({ slug: note.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = publishedResearch.find((n) => n.slug === slug);
  return note
    ? pageMetadata(note.title, note.summary, `/research/${slug}`)
    : {};
}
export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = publishedResearch.find((n) => n.slug === slug);
  if (!note) notFound();
  return (
    <>
      <ReadingProgress />
      <header className="container article-header">
        <Link href="/research" className="back-link">
          ← Back to research
        </Link>
        <div className="eyebrow article-meta">
          <span>Field note / {note.number}</span>
          <span>{note.category}</span>
          <span>{note.minutes} min read</span>
        </div>
        <h1>{note.title}</h1>
        <p>{note.summary}</p>
        <div className="article-byline">
          <span>By Raj Hridoy</span>
          <span className="educational-label">
            {note.kind === "technical-note"
              ? "Educational technical note"
              : "Approved public vulnerability case study"}
          </span>
        </div>
      </header>
      <div className="container article-illustration">
        <NoteArt type={note.illustration} />
        <p className="eyebrow">
          Conceptual illustration /{" "}
          {note.illustration === "authorization"
            ? "Identity → policy → resource"
            : note.illustration === "oauth"
              ? "Client ↔ authorization server"
              : "Input → decision → operation"}
        </p>
      </div>
      <div className="container article-layout">
        <aside className="article-toc">
          <p className="eyebrow">In this note</p>
          <nav aria-label="Article sections">
            {note.sections.map((section, i) => (
              <a href={`#${section.id}`} key={section.id}>
                <span>0{i + 1}</span>
                {section.title}
              </a>
            ))}
            <a href="#references">
              <span>↗</span>References
            </a>
          </nav>
          <p className="toc-disclaimer">
            {note.kind === "technical-note"
              ? "Original educational material. No real-world finding is claimed."
              : `Publication approved: ${note.approvedOn}. Disclosure date: ${note.disclosureDate}.`}
          </p>
        </aside>
        <article className="article-body" id="article-body">
          {note.sections.map((section, i) => (
            <section key={section.id} id={section.id}>
              <span className="eyebrow accent">0{i + 1}</span>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.code && (
                <figure className="code-example">
                  <figcaption className="eyebrow">
                    Illustrative example / controlled context
                  </figcaption>
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                </figure>
              )}
              {section.bullets && (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section id="references" className="article-references">
            <SectionLabel number="↗">References & further reading</SectionLabel>
            <p>
              {note.kind === "technical-note"
                ? "These authoritative references support the security concepts discussed above. Examples and explanatory diagrams are original, educational material."
                : "Public disclosure references and supporting technical material."}
            </p>
            {note.sources.map((source) => (
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                key={source.href}
              >
                {source.title}
                <Arrow diagonal />
              </a>
            ))}
          </section>
        </article>
      </div>
      <section className="container related-notes">
        <SectionLabel number="↗">Continue the investigation</SectionLabel>
        <h2>
          Another boundary.
          <br />
          <span className="muted">Another perspective.</span>
        </h2>
        <div className="research-grid related-grid">
          {notes
            .filter((n) => n.slug !== slug)
            .map((n) => (
              <ResearchCard key={n.slug} note={n} />
            ))}
        </div>
      </section>
    </>
  );
}
