import { PageIntro, SectionLabel, ContactInvitation } from "@/components/ui";
import { MethodologySteps } from "@/components/methodology-steps";
import { TrustExplorer } from "@/components/trust-explorer";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Methodology",
  "Understand, investigate, validate, analyze, document, and responsibly disclose. A deliberate security research workflow.",
  "/methodology",
);
export default function Methodology() {
  return (
    <>
      <PageIntro
        number="03"
        label="The research methodology"
        title="Question."
        accent="Then prove."
        description="Good research connects a precise question to repeatable evidence. Every step has a purpose, and every investigation begins with authorized scope."
      />
      <section className="container methodology-main">
        <MethodologySteps />
      </section>
      <section className="graphite-section scope-statement">
        <div className="container">
          <SectionLabel number="01">A boundary that always holds</SectionLabel>
          <h2>
            Authorization comes
            <br />
            before investigation.
          </h2>
          <p>
            I follow the relevant program’s scope and rules, use controlled
            testing, and limit evidence collection to what is necessary.
            Sensitive findings stay private until disclosure is explicitly
            approved.
          </p>
        </div>
      </section>
      <section className="container explorer-section">
        <div className="section-heading">
          <div>
            <SectionLabel number="02">A conceptual walkthrough</SectionLabel>
            <h2>Follow the request.</h2>
          </div>
          <p className="section-heading-aside">
            Explore the decisions that keep
            <br />a system’s trust boundaries intact.
          </p>
        </div>
        <TrustExplorer />
      </section>
      <ContactInvitation />
    </>
  );
}
