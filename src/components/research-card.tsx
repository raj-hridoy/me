import Link from "next/link";
import type { ResearchEntry } from "@/data/notes";
import { Arrow } from "./icons";
import { NoteArt } from "./note-art";
export function ResearchCard({ note }: { note: ResearchEntry }) {
  return (
    <Link
      className={`research-card folio folio-${note.illustration}`}
      href={`/research/${note.slug}`}
    >
      <span className="folio-number" aria-hidden="true">
        {note.number}
      </span>
      <div className="card-visual">
        <div className="card-topline">
          <span className="eyebrow">STUDY / {note.number}</span>
          <Arrow diagonal />
        </div>
        <NoteArt type={note.illustration} />
        <span className="card-visual-label">{note.category}</span>
      </div>
      <div className="card-copy">
        <div className="eyebrow card-meta">
          <span>
            {note.kind === "technical-note"
              ? "Educational technical note"
              : "Approved public disclosure"}
          </span>
          <span>{note.minutes} min read</span>
        </div>
        <h3>{note.shortTitle}</h3>
        <p>{note.summary}</p>
        <span className="card-read">
          Read the note <Arrow />
        </span>
      </div>
    </Link>
  );
}
