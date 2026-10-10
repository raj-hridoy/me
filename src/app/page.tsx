import Link from "next/link";
import { Arrow, Mark } from "@/components/icons";
import { BoundaryInstrument } from "@/components/boundary-sculpture";
import { ResearchCard } from "@/components/research-card";
import { TrustExplorer } from "@/components/trust-explorer";
import { SectionLabel, TextLink, ContactInvitation } from "@/components/ui";
import { notes } from "@/data/notes";
import { researchAreas } from "@/data/site";

export default function Home() {
  return (
    <>
      <section className="opening-scene obsidian-section">
        <div className="container scene-topline">
          <p className="eyebrow">
            <span className="live-dot" /> Raj Hridoy / Independent security
            researcher
          </p>
          <span className="eyebrow">Bangladesh · Boundary studies / 01</span>
        </div>
        <div className="container scene-composition">
          <h1 className="scene-title">
            <span className="scene-prelude">I explore where</span>
            <span className="scene-trust">TRUST</span>
            <span className="scene-breaks">
              BREAKS<span className="scene-period">.</span>
            </span>
          </h1>
          <BoundaryInstrument />
          <div className="scene-caption">
            <span className="eyebrow">Look past the interface.</span>
            <p>
              Independent security research at the edges of web applications,
              APIs, and complex systems.
            </p>
            <Link href="/research" className="scene-research">
              Explore research
              <Arrow diagonal />
            </Link>
          </div>
          <p className="scene-figure eyebrow">
            Fig. 01 — A study of the invisible
          </p>
        </div>
        <div className="container scene-footnote">
          <a href="#selected-research" className="scroll-cue">
            <span>↓</span>
            <span className="eyebrow">Begin the investigation</span>
          </a>
          <p className="eyebrow">
            Identity is a fact. Permission is a decision.
          </p>
          <Link href="/contact" className="eyebrow">
            Open a conversation ↗
          </Link>
        </div>
        <div className="acknowledgment-strip">
          <div className="container">
            <p className="eyebrow">
              Research acknowledged
              <br />
              <span>Through disclosure programs</span>
            </p>
            <span className="dod-wordmark">
              U.S. Department
              <br />
              of Defense
            </span>
            <span className="sony-wordmark">SONY</span>
            <Link href="/recognition">
              View acknowledgments <Arrow diagonal />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="selected-research obsidian-section"
        id="selected-research"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <SectionLabel number="01">
                From the research notebook
              </SectionLabel>
              <h2>
                Look closer<span className="accent-period">.</span>
              </h2>
            </div>
            <div className="section-heading-aside">
              <p>
                Three educational studies.
                <br />
                Different ways into the same question.
              </p>
              <TextLink href="/research">All field notes</TextLink>
            </div>
          </div>
          <div className="selected-folios">
            {notes.map((note) => (
              <ResearchCard note={note} key={note.slug} />
            ))}
          </div>
        </div>
      </section>
      <section
        className="experiment-section deep-section"
        id="boundary-experiment"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <SectionLabel number="02">An experiment in trust</SectionLabel>
              <h2>
                Being known
                <br />
                <span>isn’t being allowed.</span>
              </h2>
            </div>
            <div className="section-heading-aside">
              <span className="experiment-stamp" aria-hidden="true">
                ↳
              </span>
              <p>
                One fictional request.
                <br />
                Change its context. Watch its path.
              </p>
            </div>
          </div>
          <TrustExplorer />
          <div className="experiment-footer">
            <span className="eyebrow">A model, not a live security test.</span>
            <TextLink href="/methodology">
              The thinking behind the experiment
            </TextLink>
          </div>
        </div>
      </section>
      <section className="philosophy structural-section">
        <div className="container">
          <SectionLabel number="03">The working principle</SectionLabel>
          <h2>
            Every system
            <br />
            has an <span>assumption.</span>
            <br />
            <span className="philosophy-last">I look closer.</span>
          </h2>
          <div className="philosophy-bottom">
            <span className="philosophy-cross" aria-hidden="true">
              ×
            </span>
            <p>
              Security failures begin where assumptions stop matching reality. I
              study the intended behavior, examine the trust decision, validate
              the impact, and communicate it responsibly.
            </p>
            <TextLink href="/methodology" light>
              How I investigate
            </TextLink>
          </div>
        </div>
      </section>
      <section className="specializations deep-section">
        <div className="container atlas-grid">
          <div className="atlas-intro">
            <SectionLabel number="04">Surfaces of investigation</SectionLabel>
            <h2>
              The system
              <br />
              is connected.
              <br />
              <span>So is the work.</span>
            </h2>
            <div className="atlas-symbol" aria-hidden="true">
              <svg viewBox="0 0 320 320" fill="none">
                <g stroke="currentColor">
                  {[28, 58, 88, 118, 148].map((r) => (
                    <rect
                      x={160 - r}
                      y={160 - r}
                      width={r * 2}
                      height={r * 2}
                      key={r}
                    />
                  ))}
                  <path
                    d="M0 160h320M160 0v320M48 48l224 224M48 272 272 48"
                    strokeDasharray="2 5"
                  />
                  <rect
                    x="155"
                    y="155"
                    width="10"
                    height="10"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </div>
            <p>
              From an individual request to the infrastructure that stands
              behind it.
            </p>
          </div>
          <div className="specialization-list">
            {researchAreas.map((area, i) => (
              <Link
                className="specialization"
                href={`/research?category=${encodeURIComponent(area.title)}`}
                key={area.title}
              >
                <span className="eyebrow">0{i + 1}</span>
                <div>
                  <h3>{area.title}</h3>
                  <p>{area.detail}</p>
                </div>
                <Arrow diagonal />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="about-preview obsidian-section">
        <div className="container about-preview-grid">
          <div className="identity-print" aria-hidden="true">
            <Mark />
            <i>
              Independent
              <br />
              by design.
            </i>
          </div>
          <div>
            <SectionLabel number="05">The researcher</SectionLabel>
            <h2>
              Raj Hridoy.
              <br />
              <span>
                Curiosity,
                <br />
                with purpose.
              </span>
            </h2>
            <p>
              I’m an independent cybersecurity researcher and bug bounty hunter
              from Bangladesh. I investigate security-sensitive behavior in web
              applications, APIs, and modern software infrastructure.
            </p>
            <p>
              Careful investigation. Clear evidence.
              <br />
              Responsible disclosure.
            </p>
            <TextLink href="/about" light>
              Meet the researcher
            </TextLink>
          </div>
        </div>
      </section>
      <ContactInvitation />
    </>
  );
}
