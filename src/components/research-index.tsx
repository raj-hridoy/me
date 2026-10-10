"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { publishedResearch } from "@/data/notes";
import { categories } from "@/data/site";
import { ResearchCard } from "./research-card";
export function QueryResearchIndex() {
  const requested = useSearchParams().get("category") ?? undefined;
  return <ResearchIndex key={requested ?? "all"} requested={requested} />;
}
export function ResearchIndex({ requested }: { requested?: string }) {
  const initial =
    categories.find((category) => category === requested) ?? "All research";
  const [selection, setSelection] = useState<string | null>(null);
  const selected = selection ?? initial;
  const setSelected = setSelection;
  const visible = publishedResearch.filter(
    (note) =>
      selected === "All research" || note.tags.some((tag) => tag === selected),
  );
  return (
    <>
      <div
        className="research-filters"
        role="group"
        aria-label="Filter research by category"
      >
        {["All research", ...categories].map((category) => (
          <button
            key={category}
            aria-pressed={selected === category}
            onClick={() => setSelected(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="index-caption">
        <p role="status" className="eyebrow">
          {visible.length} {visible.length === 1 ? "note" : "notes"} /{" "}
          {selected}
        </p>
        <span className="eyebrow">Original notes. Shared understanding.</span>
      </div>
      <div
        className="research-grid"
        key={selected}
        data-filter-changed={selection !== null ? "true" : undefined}
      >
        {visible.map((note) => (
          <ResearchCard note={note} key={note.slug} />
        ))}
        {visible.length === 0 && (
          <p className="empty-archive">
            No published notes in this area yet. Choose another research surface
            to keep reading.
          </p>
        )}
      </div>
      <aside className="disclosure-note">
        <span className="eyebrow">A note on publication</span>
        <p>
          These are educational explanations of security concepts and research
          methods. They are not reports of vulnerabilities I have discovered.
          Detailed case studies will appear here only when disclosure is
          approved.
        </p>
      </aside>
    </>
  );
}
