"use client";
import { useState } from "react";
import { workflow } from "@/data/site";
import { Arrow } from "./icons";
import { BoundarySculpture } from "./boundary-sculpture";
export function MethodologySteps() {
  const [active, setActive] = useState(0);
  return (
    <div className="methodology-steps">
      <noscript>
        <style>{`.methodology-panels section[hidden]{display:block!important;margin-top:35px;border-top:1px solid var(--line);padding-top:35px}.methodology-list{display:none!important}`}</style>
      </noscript>
      <div className="methodology-list">
        {workflow.map((step, i) => (
          <button
            key={step.title}
            aria-expanded={active === i}
            aria-controls={`step-${i}`}
            onClick={() => setActive(i)}
            className={active === i ? "selected" : ""}
          >
            <span className="eyebrow">0{i + 1}</span>
            <span>{step.title}</span>
            <Arrow diagonal />
          </button>
        ))}
      </div>
      <div className="methodology-panels">
        {workflow.map((step, i) => (
          <section id={`step-${i}`} hidden={active !== i} key={step.title}>
            <div className="methodology-symbol" aria-hidden="true">
              {active === i && (
                <BoundarySculpture
                  separation={i * 15}
                  section={i === 2 || i === 3}
                  rotation={i * 40}
                  scan={i % 5}
                />
              )}
            </div>
            <p className="eyebrow accent">
              Phase 0{i + 1} / {step.title}
            </p>
            <h2>{step.question}</h2>
            <p>{step.body}</p>
            <div className="phase-outcome">
              <span className="eyebrow">The outcome</span>
              <p>{step.outcome}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
