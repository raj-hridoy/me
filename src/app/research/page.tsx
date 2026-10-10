import { PageIntro } from "@/components/ui";
import { QueryResearchIndex, ResearchIndex } from "@/components/research-index";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Research",
  "Original educational technical notes on API security, access control, OAuth, and source-code review.",
  "/research",
);
export default function Research() {
  return (
    <>
      <PageIntro
        number="01"
        label="The research archive"
        title="Field"
        accent="notes."
        description="Original technical notes on software security, trust boundaries, and the methods behind careful investigation."
      />
      <section className="container research-index">
        <Suspense fallback={<ResearchIndex />}>
          <QueryResearchIndex />
        </Suspense>
      </section>
    </>
  );
}
