"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Arrow } from "./icons";
import { evaluateRequest, type CallerContext } from "@/lib/request-policy";
const stages = [
  {
    title: "Request entry",
    label: "01 / REQUEST",
    question: "What is being asked?",
    body: "The request names an operation and a resource. Treat client-supplied input as untrusted, regardless of how the interface presents it.",
    detail: "Boundary: outside input → application context",
  },
  {
    title: "Authentication",
    label: "02 / IDENTITY",
    question: "Who is asking?",
    body: "Validate the session or credential and establish the caller’s identity. An authenticated caller still needs permission for the requested operation.",
    detail: "Boundary: claimed identity → verified identity",
  },
  {
    title: "Authorization",
    label: "03 / POLICY",
    question: "Is this action permitted?",
    body: "Evaluate the verified subject, requested action, resource, and context. A caller cannot gain permission by simply supplying another resource identifier.",
    detail: "Boundary: verified identity → allowed operation",
  },
  {
    title: "Resource access",
    label: "04 / RESOURCE",
    question: "What can this context reach?",
    body: "Apply the allowed operation to the intended resource. Preserve tenant and ownership constraints through database queries, nested data, and downstream services.",
    detail: "Boundary: allowed operation → scoped resource",
  },
  {
    title: "Security outcome",
    label: "05 / OUTCOME",
    question: "What should leave the system?",
    body: "Allow only the permitted response or change. If the policy denies access, return no protected resource and perform no protected mutation.",
    detail: "Boundary: internal state → permitted result",
  },
];
export function TrustExplorer() {
  const [active, setActive] = useState(2);
  const [allowed, setAllowed] = useState(false);
  const [caller, setCaller] = useState<CallerContext>("shared");
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState(0);
  const [arrived, setArrived] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const stage = stages[active];
  const decision = evaluateRequest(caller, allowed);
  const clearRun = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setArrived(false);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    function settleQuietly() {
      if (!running || (!document.hidden && !media.matches)) return;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setRunning(false);
      setActive(decision.stop);
      setArrived(true);
    }
    media.addEventListener("change", settleQuietly);
    document.addEventListener("visibilitychange", settleQuietly);
    settleQuietly();
    return () => {
      media.removeEventListener("change", settleQuietly);
      document.removeEventListener("visibilitychange", settleQuietly);
    };
  }, [running, decision.stop]);
  const sendRequest = () => {
    clearRun();
    setRun((value) => value + 1);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setActive(decision.stop);
      setArrived(true);
      return;
    }
    setActive(0);
    setRunning(true);
    for (let i = 1; i <= decision.stop; i++)
      timers.current.push(setTimeout(() => setActive(i), i * 480));
    timers.current.push(
      setTimeout(
        () => {
          setRunning(false);
          setArrived(true);
        },
        (decision.stop + 1) * 480,
      ),
    );
  };
  return (
    <div
      className={`trust-explorer ${decision.permitted ? "request-permitted" : "request-denied"}`}
    >
      <noscript>
        <style>{`.request-console,.explorer-flow,.diagram-node{display:none!important}`}</style>
        <p className="explorer-nojs">
          This model shows a verified caller requesting another owner’s private
          document. Without an explicit read grant, the authorization boundary
          denies access.
        </p>
      </noscript>
      <div className="explorer-toolbar">
        <span className="eyebrow">
          <span className="live-dot" /> Boundary experiment / fictional system
        </span>
        <span className="eyebrow">
          Change the context. Follow the consequence.
        </span>
      </div>
      <div className="request-visual">
        <svg
          className="request-graph-desktop"
          viewBox="0 0 1100 390"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="currentColor" opacity=".12">
            <path d="M35 195h1030M550 15v360" strokeDasharray="2 7" />
            {[70, 170, 270].map((y) => (
              <path key={y} d={`M35 ${y}h1030`} />
            ))}
          </g>
          <g className="policy-membrane" stroke="currentColor" strokeWidth=".8">
            {Array.from({ length: 28 }, (_, i) => (
              <path
                key={i}
                opacity={0.2 + i / 55}
                d={`M${485 + i * 3} ${48 + i * 3}h${130 - i * 2}v${292 - i * 6}h-${130 - i * 2}Z`}
              />
            ))}
            <path
              d="M545 32 650 90 587 355 478 301Z"
              strokeDasharray="3 5"
              opacity=".35"
            />
          </g>
          <path
            className="request-route"
            d="M100 195H310L565 195H795L995 195"
            stroke="currentColor"
            opacity=".25"
          />
          <path
            key={`beam-${run}-${caller}-${allowed}`}
            className={`request-beam ${running ? "travelling" : ""}`}
            d={`M100 195H${decision.stop === 1 ? 310 : decision.stop === 2 ? 565 : 995}`}
            pathLength="100"
            stroke={
              decision.permitted ? "var(--accent-bright)" : "var(--warning)"
            }
            strokeWidth="2"
          />
          {[100, 310, 565, 795, 995].map((x, i) => (
            <g
              key={x}
              className={`request-node ${active === i ? "inspecting" : ""} ${arrived && i === decision.stop ? "arrived" : ""}`}
            >
              <rect
                x={x - (i === 2 ? 34 : 22)}
                y={195 - (i === 2 ? 34 : 22)}
                width={i === 2 ? 68 : 44}
                height={i === 2 ? 68 : 44}
                fill="var(--bg-deep)"
                stroke={i === active ? "var(--accent-bright)" : "currentColor"}
              />
              <rect
                x={x - (i === 2 ? 45 : 33)}
                y={195 - (i === 2 ? 45 : 33)}
                width={i === 2 ? 90 : 66}
                height={i === 2 ? 90 : 66}
                stroke="currentColor"
                opacity=".2"
              />
              <text
                x={x}
                y="199"
                textAnchor="middle"
                fill="currentColor"
                fontSize="11"
              >
                0{i + 1}
              </text>
              <path
                d={`M${x} ${i === 2 ? 246 : 233}v17`}
                stroke="currentColor"
                opacity=".5"
              />
              <text
                x={x}
                y="270"
                textAnchor="middle"
                fill="currentColor"
                fontSize="11"
                letterSpacing="1"
              >
                {["REQUEST", "IDENTITY", "POLICY", "RESOURCE", "RESPONSE"][i]}
              </text>
            </g>
          ))}
          <text
            x="560"
            y="22"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            letterSpacing="2"
          >
            THE INVISIBLE BOUNDARY
          </text>
          <text
            x="45"
            y="340"
            fill="currentColor"
            fontSize="10"
            letterSpacing="1"
          >
            READ / PRIVATE DOCUMENT
          </text>
          <text
            x="1040"
            y="340"
            textAnchor="end"
            fill={
              decision.permitted ? "var(--accent-bright)" : "var(--warning)"
            }
            fontSize="10"
            letterSpacing="1"
          >
            {running
              ? "TRACING REQUEST"
              : decision.permitted
                ? "SCOPED READ PERMITTED"
                : "BOUNDARY HOLDS"}
          </text>
        </svg>
        {stages.map((item, i) => (
          <button
            key={item.title}
            className="diagram-node"
            style={{
              left: `${([100, 310, 565, 795, 995][i] / 1100) * 100}%`,
              top: "50%",
            }}
            aria-label={`Inspect ${item.title.toLowerCase()} node`}
            aria-pressed={active === i}
            aria-controls={`${id}-panel`}
            onClick={() => {
              clearRun();
              setActive(i);
            }}
          />
        ))}
      </div>
      <div className="request-mobile-visual">
        <svg
          className="request-graph-mobile"
          viewBox="0 0 340 335"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="currentColor" opacity=".15">
            <path d="M20 75h300M20 235h300M166 30v265" strokeDasharray="2 5" />
          </g>
          <text
            x="20"
            y="22"
            fill="currentColor"
            fontSize="8"
            letterSpacing="1"
          >
            READ / PRIVATE DOCUMENT
          </text>
          <g stroke="currentColor" strokeWidth=".6">
            {Array.from({ length: 18 }, (_, i) => (
              <rect
                key={i}
                x={251 + i * 1.4}
                y={41 + i * 1.4}
                width={68 - i * 2.8}
                height={68 - i * 2.8}
                opacity={0.15 + i / 40}
              />
            ))}
          </g>
          <path d="M42 75H288V235H166" stroke="currentColor" opacity=".25" />
          <path
            key={`mobile-beam-${run}-${caller}-${allowed}`}
            className={`request-beam ${running ? "travelling" : ""}`}
            d={
              decision.stop === 1
                ? "M42 75H166"
                : decision.stop === 2
                  ? "M42 75H288"
                  : "M42 75H288V235H166"
            }
            pathLength="100"
            stroke={
              decision.permitted ? "var(--accent-bright)" : "var(--warning)"
            }
            strokeWidth="1.5"
          />
          {[
            [42, 75],
            [166, 75],
            [288, 75],
            [288, 235],
            [166, 235],
          ].map(([x, y], i) => (
            <g
              key={i}
              className={`request-node ${active === i ? "inspecting" : ""} ${arrived && i === decision.stop ? "arrived" : ""}`}
            >
              <rect
                x={x - 20}
                y={y - 20}
                width="40"
                height="40"
                fill="var(--bg-deep)"
                stroke={active === i ? "var(--accent-bright)" : "currentColor"}
              />
              <rect
                x={x - 27}
                y={y - 27}
                width="54"
                height="54"
                stroke="currentColor"
                opacity=".2"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="currentColor"
                fontSize="10"
              >
                0{i + 1}
              </text>
              <text
                x={x}
                y={y + 48}
                textAnchor="middle"
                fill="currentColor"
                fontSize="8"
                letterSpacing=".6"
              >
                {["REQUEST", "IDENTITY", "POLICY", "RESOURCE", "RESPONSE"][i]}
              </text>
            </g>
          ))}
          <path d="M20 145h300" stroke="currentColor" opacity=".12" />
          <text
            x="20"
            y="167"
            fill={
              decision.permitted ? "var(--accent-bright)" : "var(--warning)"
            }
            fontSize="8"
            letterSpacing=".5"
          >
            {running
              ? "TRACING THE REQUEST"
              : decision.permitted
                ? "SCOPED READ PERMITTED"
                : "BOUNDARY HOLDS"}
          </text>
          <path
            d="M288 153v38m-4-5 4 5 4-5"
            stroke="currentColor"
            opacity={decision.permitted ? 1 : 0.2}
          />
          <text
            x="20"
            y="320"
            fill="currentColor"
            fontSize="7"
            letterSpacing=".6"
          >
            IDENTITY ≠ PERMISSION
          </text>
        </svg>
        {stages.map((item, i) => (
          <button
            key={item.title}
            className="diagram-node"
            style={{
              left: `${([42, 166, 288, 288, 166][i] / 340) * 100}%`,
              top: `${([75, 75, 75, 235, 235][i] / 335) * 100}%`,
            }}
            aria-label={`Inspect ${item.title.toLowerCase()} node`}
            aria-pressed={active === i}
            aria-controls={`${id}-panel`}
            onClick={() => {
              clearRun();
              setActive(i);
            }}
          />
        ))}
      </div>
      <div className="request-console">
        <div className="caller-select">
          <label htmlFor={`${id}-caller`} className="eyebrow">
            01 / Caller context
          </label>
          <select
            id={`${id}-caller`}
            value={caller}
            onChange={(event) => {
              clearRun();
              setCaller(event.target.value as CallerContext);
            }}
          >
            <option value="shared">Another verified user</option>
            <option value="owner">The resource owner</option>
            <option value="anonymous">No verified session</option>
          </select>
        </div>
        <button
          className="policy-toggle"
          aria-pressed={allowed}
          onClick={() => {
            clearRun();
            setAllowed(!allowed);
          }}
        >
          <span
            className={`switch ${allowed ? "on" : ""}`}
            aria-hidden="true"
          />
          <span>Explicit sharing grant</span>
        </button>
        <button
          className="send-request"
          onClick={sendRequest}
          disabled={running}
        >
          {running ? "Following the request…" : "Send the request"}
          <Arrow />
        </button>
      </div>
      <div
        className="explorer-flow"
        role="tablist"
        aria-label="Request security boundaries"
      >
        {stages.map((item, i) => (
          <button
            key={item.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${id}-tab-${i}`}
            role="tab"
            aria-label={`${String(i + 1).padStart(2, "0")} ${item.title}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => {
              clearRun();
              setActive(i);
            }}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight" || event.key === "ArrowDown")
                next = (i + 1) % stages.length;
              if (event.key === "ArrowLeft" || event.key === "ArrowUp")
                next = (i + stages.length - 1) % stages.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = stages.length - 1;
              if (next !== undefined) {
                event.preventDefault();
                clearRun();
                setActive(next);
                refs.current[next]?.focus();
              }
            }}
            className={active === i ? "active" : ""}
          >
            <span className="flow-node">
              <span>{String(i + 1).padStart(2, "0")}</span>
            </span>
            <span className="flow-title-full">{item.title}</span>
            <span className="flow-title-short" aria-hidden="true">
              {["Request", "Identity", "Policy", "Resource", "Response"][i]}
            </span>
            {i < stages.length - 1 && (
              <span
                className={`flow-connection${i < active ? " traversed" : ""}`}
              >
                <i />
              </span>
            )}
          </button>
        ))}
      </div>
      <div
        className="explorer-detail"
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={0}
      >
        <div className="explorer-stage-copy" key={active}>
          <span className="eyebrow accent">{stage.label}</span>
          <h3>{stage.question}</h3>
          <p>{stage.body}</p>
          <span className="boundary-caption">{stage.detail}</span>
        </div>
        <div className="policy-simulator">
          <span className="eyebrow">02 / The evaluated decision</span>
          <p>{decision.reason}</p>
          <div
            className={`policy-outcome ${decision.permitted ? "permitted" : ""}`}
            role="status"
          >
            <span>{decision.permitted ? "PERMIT" : "DENY"}</span>
            <Arrow />
            <span>{decision.result}</span>
          </div>
          <p className="request-completion" role="status">
            {running
              ? "Request in transit."
              : arrived
                ? `${decision.permitted ? "Request reached its permitted response" : `Request stopped at ${stages[decision.stop].title.toLowerCase()}`}. ${decision.result}.`
                : "Adjust the context, then send a request to trace its path."}
          </p>
          <small>A teaching scenario using fictional resources.</small>
        </div>
      </div>
    </div>
  );
}
