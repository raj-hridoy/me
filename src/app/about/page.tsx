import {
  PageIntro,
  SectionLabel,
  TextLink,
  ContactInvitation,
} from "@/components/ui";
import { BoundaryArt } from "@/components/boundary-art";
import { researchAreas } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "About",
  "Meet Raj Hridoy, an independent cybersecurity researcher and bug bounty hunter from Bangladesh.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageIntro
        number="02"
        label="About the researcher"
        title="Raj"
        accent="Hridoy."
        description="I’m Raj Hridoy, an independent cybersecurity researcher and bug bounty hunter from Bangladesh."
      />
      <section className="container about-story">
        <div className="about-story-art">
          <BoundaryArt compact />
          <p className="eyebrow">Independent research / Bangladesh</p>
        </div>
        <div className="prose">
          <h2>
            Understand the system.
            <br />
            Question the assumption.
          </h2>
          <p>
            My work focuses on identifying, understanding, and responsibly
            reporting security vulnerabilities across web applications, APIs,
            and modern software infrastructure.
          </p>
          <p>
            I’m particularly interested in authorization boundaries,
            authentication systems, business logic weaknesses, and
            security-critical behavior revealed through source-code analysis.
          </p>
          <p>
            I approach vulnerability research by understanding how systems are
            intended to work, examining where security assumptions may fail, and
            validating findings through controlled technical investigation.
          </p>
          <p>
            My independent vulnerability research has received acknowledgments
            through the U.S. Department of Defense and Sony vulnerability
            disclosure programs.
          </p>
          <TextLink href="/recognition">View acknowledgments</TextLink>
        </div>
      </section>
      <section className="graphite-section about-principles">
        <div className="container">
          <SectionLabel number="01">Principles in practice</SectionLabel>
          <div className="principle-grid">
            {[
              {
                title: "Context before conclusions.",
                body: "A behavior only becomes a security finding when its prerequisites, intended controls, and realistic impact are understood.",
              },
              {
                title: "Evidence over assumptions.",
                body: "Controlled reproduction and clear limitations make a technical report useful to the people who need to act on it.",
              },
              {
                title: "Responsibility throughout.",
                body: "Authorized scope, minimal exposure, and constructive disclosure guide the investigation from first question to final report.",
              },
            ].map((item, i) => (
              <div key={item.title}>
                <span className="eyebrow">0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container interests">
        <SectionLabel number="02">
          Research interests & working tools
        </SectionLabel>
        <div className="interests-grid">
          <h2>
            A practical toolkit.
            <br />
            <span className="muted">A questioning mindset.</span>
          </h2>
          <div>
            <p>
              My research interests span{" "}
              {researchAreas.map((a) => a.title.toLowerCase()).join(", ")}.
            </p>
            <p>
              I work with Linux, Burp Suite, Wireshark, Nmap, Git, Docker,
              Browser Developer Tools, and HTTP debugging tools to understand
              and examine application behavior.
            </p>
            <TextLink href="/methodology">Follow the methodology</TextLink>
          </div>
        </div>
      </section>
      <ContactInvitation />
    </>
  );
}
