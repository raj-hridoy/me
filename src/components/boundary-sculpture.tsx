"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useArchitectureMotion } from "./use-architecture-motion";

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

const layers = [
  { label: "Identity", detail: "Identity establishes who is asking." },
  { label: "Policy", detail: "Policy decides which operation is allowed." },
  {
    label: "Resource",
    detail: "Resource access remains scoped to the decision.",
  },
];

/** Perspective-projected architecture: rectangular plates, channels and policy planes. */
export function BoundarySculpture({
  separation = 22,
  section = false,
  tone = "ink",
  scan = 2,
  rotation = 0,
  focus = 1,
  focused = false,
  immediate = false,
}: {
  separation?: number;
  section?: boolean;
  tone?: "ink" | "paper";
  scan?: number;
  rotation?: number;
  focus?: number;
  focused?: boolean;
  immediate?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const svg = useRef<SVGSVGElement>(null);
  const geometry = useMemo(() => {
    const yaw = ((rotation + 34) * Math.PI) / 180;
    const project = (x: number, y: number, z: number) => {
      const u = x * Math.cos(yaw) - z * Math.sin(yaw);
      const depth = x * Math.sin(yaw) + z * Math.cos(yaw);
      return [320 + u * 140, 295 + depth * 62 + y * 146];
    };
    const path = (points: number[][]) =>
      "M" +
      points.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L") +
      "Z";
    const plate = (height: number, extent: number) =>
      [
        [-extent, height, -extent],
        [extent, height, -extent],
        [extent, height, extent],
        [-extent, height, extent],
      ].map(([x, y, z]) => project(x, y, z));
    const plates = Array.from({ length: 24 }, (_, index) => {
      const band = Math.floor(index / 8);
      const height =
        (index / 23 - 0.5) * 2.05 + ((band - 1) * separation) / 160;
      const extent = band === 1 ? 0.96 : 1.12;
      const vertices = plate(height, extent);
      return {
        index,
        band,
        d: path(vertices),
        inset: path(plate(height, extent * 0.61)),
        edge:
          "M" +
          vertices
            .slice(1, 4)
            .map((p) => p.map((v) => v.toFixed(1)).join(","))
            .join("L"),
        side: path([
          vertices[1],
          vertices[2],
          vertices[3],
          ...[vertices[3], vertices[2], vertices[1]].map(([x, y]) => [
            x,
            y + 5,
          ]),
        ]),
      };
    }).reverse();
    const planeHeight =
      (focus - 1) * (0.72 + separation / 160) + (scan - 2) * 0.06;
    return {
      plates,
      plane: path(plate(planeHeight, 1.22)),
      inner: path(plate(planeHeight, 0.72)),
      core: project(0, planeHeight, 0),
      rails: [-1, 1].map(
        (x) =>
          "M" +
          project(x, -1.28, -1).join(",") +
          "L" +
          project(x, 1.28, -1).join(","),
      ),
      route:
        "M" +
        project(0, -1.35, 0).join(",") +
        "L" +
        project(0, 1.35, 0).join(","),
    };
  }, [separation, rotation, focus, scan]);
  const viewBox = focused
    ? `-8 ${geometry.core[1] - 255} 560 525`
    : "0 0 640 600";
  const targets = useMemo(() => {
    const result: Record<string, Record<string, string | number>> = {
      svg: { viewBox },
      clip: { height: section ? 302 : 600 },
      plane: { d: geometry.plane },
      inner: { d: geometry.inner },
      route: { d: geometry.route },
      core: { x: geometry.core[0] - 4, y: geometry.core[1] - 4 },
    };
    for (const plate of geometry.plates)
      for (const name of ["d", "inset", "edge", "side"] as const)
        result[`${plate.index}-${name}`] = { d: plate[name] };
    geometry.rails.forEach((d, index) => {
      result[`rail-${index}`] = { d };
    });
    return result;
  }, [geometry, section, viewBox]);
  useArchitectureMotion(svg, targets, immediate);
  return (
    <svg
      ref={svg}
      className={`boundary-sculpture ${tone}`}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-section`}>
          <rect
            data-morph="clip"
            x="0"
            y="0"
            width="640"
            height={section ? 302 : 600}
          />
        </clipPath>
        <linearGradient id={`${id}-material`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--platinum)" stopOpacity=".11" />
          <stop
            offset=".47"
            stopColor="var(--surface-raised)"
            stopOpacity=".92"
          />
          <stop offset="1" stopColor="var(--bg)" stopOpacity=".98" />
        </linearGradient>
        <linearGradient id={`${id}-policy`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="var(--accent)" stopOpacity=".38" />
          <stop offset="1" stopColor="var(--violet)" stopOpacity=".06" />
        </linearGradient>
      </defs>
      <g
        className="sculpture-grid"
        stroke="currentColor"
        strokeWidth=".6"
        opacity=".17"
      >
        <path d="M20 300h600M320 15v570" strokeDasharray="2 7" />
        <path d="M75 90V65h25M540 65h25v25M75 510v25h25M540 535h25v-25" />
        <path d="M105 400 320 515 550 392 335 277Z" />
        {geometry.rails.map((d, i) => (
          <path data-morph={`rail-${i}`} key={i} d={d} strokeDasharray="2 4" />
        ))}
      </g>
      <g className="sculpture-rings" clipPath={`url(#${id}-section)`}>
        {geometry.plates.map(({ index, band, d, inset, edge, side }) => (
          <g
            key={index}
            className={
              band === focus
                ? "structural-layer selected-layer"
                : "structural-layer"
            }
          >
            <path
              data-morph={`${index}-side`}
              d={side}
              fill="var(--bg-deep)"
              stroke="var(--line-bright)"
              strokeWidth=".6"
            />
            <path
              data-morph={`${index}-d`}
              d={d}
              fill={`url(#${id}-material)`}
              stroke="var(--platinum)"
              strokeOpacity={band === focus ? 0.8 : 0.36}
              strokeWidth=".8"
            />
            <path
              data-morph={`${index}-inset`}
              d={inset}
              stroke="var(--platinum)"
              strokeWidth=".55"
              strokeOpacity=".23"
            />
            <path
              data-morph={`${index}-edge`}
              d={edge}
              stroke={
                band === focus ? "var(--accent-bright)" : "var(--platinum)"
              }
              strokeWidth={index % 8 === 0 ? 1.4 : 0.7}
              strokeOpacity={band === focus ? 0.8 : 0.4}
            />
          </g>
        ))}
      </g>
      <g className="sculpture-section">
        <path
          data-morph="plane"
          d={geometry.plane}
          fill={`url(#${id}-policy)`}
          stroke="var(--accent-bright)"
          strokeWidth="1.4"
        />
        <path
          data-morph="inner"
          d={geometry.inner}
          stroke="var(--accent-bright)"
          strokeWidth=".65"
          strokeDasharray="3 5"
        />
        <path
          data-morph="route"
          className="architecture-signal"
          d={geometry.route}
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="3 6"
          opacity=".65"
        />
        <rect
          data-morph="core"
          x={geometry.core[0] - 4}
          y={geometry.core[1] - 4}
          width="8"
          height="8"
          fill="var(--accent-bright)"
        />
      </g>
      <g className="sculpture-labels" stroke="var(--platinum)" strokeWidth=".6">
        <path d="M475 280h66l24-24h44" />
        <text
          x="515"
          y="244"
          stroke="none"
          fill="var(--platinum)"
          fontSize="9"
          letterSpacing="1.2"
        >
          {layers[focus].label.toUpperCase()} PLANE
        </text>
        <text
          className="sculpture-identity"
          x="25"
          y="480"
          stroke="none"
          fill="var(--platinum)"
          fontSize="8"
          letterSpacing="1.2"
        >
          RH / TRUST ARCHITECTURE
        </text>
      </g>
    </svg>
  );
}

export function BoundaryInstrument() {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [separation, setSeparation] = useState(22);
  const [section, setSection] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [focus, setFocus] = useState(1);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; angle: number } | null>(null);
  const rotate = (angle: number) => setRotation(((angle % 360) + 360) % 360);
  return (
    <div
      className="boundary-instrument"
      data-focus={layers[focus].label.toLowerCase()}
      data-view={focused ? "focused" : "overview"}
    >
      <div
        className="instrument-art"
        onPointerDown={(event) => {
          if (
            !ready ||
            event.button !== 0 ||
            (event.target as Element).closest("button")
          )
            return;
          drag.current = { x: event.clientX, angle: rotation };
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current)
            rotate(drag.current.angle + (event.clientX - drag.current.x) * 0.6);
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        <BoundarySculpture
          separation={separation}
          section={section}
          rotation={rotation}
          focus={focus}
          focused={focused}
          immediate={dragging}
        />
        <button
          className="architecture-focus"
          disabled={!ready}
          aria-label={
            focused
              ? "Restore architecture overview"
              : "Focus selected architecture layer"
          }
          aria-pressed={focused}
          onClick={() => setFocused(!focused)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d={
                focused
                  ? "M4 9h5V4m11 5h-5V4M4 15h5v5m11-5h-5v5"
                  : "M4 9V4h5m11 5V4h-5M4 15v5h5m11-5v5h-5"
              }
            />
            <path d="M10 12h4M12 10v4" />
          </svg>
        </button>
        {layers.map((layer, index) => {
          const nodeY = 295 + (index - 1) * (0.72 + separation / 160) * 146;
          const viewY = focused
            ? 295 + (focus - 1) * (0.72 + separation / 160) * 146 - 255
            : 0;
          return (
            <button
              key={layer.label}
              className="architecture-node"
              disabled={!ready}
              hidden={focused && focus !== index}
              style={{
                left: focused ? `${(328 / 560) * 100}%` : "50%",
                top: `${((nodeY - viewY) / (focused ? 525 : 600)) * 100}%`,
              }}
              aria-label={`Inspect ${layer.label.toLowerCase()} architecture node`}
              aria-pressed={focus === index}
              onClick={() => setFocus(index)}
            >
              <span aria-hidden="true" />
              <span className="architecture-node-label" aria-hidden="true">
                {layer.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="instrument-controls">
        <div
          className="instrument-orbit"
          role="group"
          aria-label="Rotate the boundary sculpture"
        >
          <button
            disabled={!ready}
            aria-label="Rotate left"
            onClick={() => rotate(rotation - 30)}
          >
            ←
          </button>
          <output aria-label="Sculpture rotation">
            {String(Math.round(rotation)).padStart(3, "0")}°
          </output>
          <button
            disabled={!ready}
            aria-label="Rotate right"
            onClick={() => rotate(rotation + 30)}
          >
            →
          </button>
        </div>
        <div
          className="instrument-layers"
          role="group"
          aria-label="Inspect architectural layers"
        >
          {layers.map((layer, index) => (
            <button
              disabled={!ready}
              key={layer.label}
              aria-label={`Inspect ${layer.label.toLowerCase()} layer`}
              aria-pressed={focus === index}
              onClick={() => setFocus(index)}
            >
              {layer.label}
            </button>
          ))}
        </div>
        <label htmlFor="boundary-separation">
          <span className="eyebrow">01 / Separate the layers</span>
          <span className="eyebrow">
            {String(separation).padStart(2, "0")} ↔
          </span>
        </label>
        <input
          disabled={!ready}
          id="boundary-separation"
          type="range"
          min="0"
          max="100"
          value={separation}
          onChange={(event) => setSeparation(Number(event.target.value))}
          aria-label="Boundary separation"
        />
        <button
          disabled={!ready}
          className="section-toggle"
          aria-pressed={section}
          onClick={() => setSection(!section)}
        >
          <span className="instrument-toggle-mark" aria-hidden="true">
            {section ? "−" : "+"}
          </span>
          {section ? "Restore the surface" : "Reveal the cross-section"}
        </button>
        <p className="instrument-note">
          <span className="instrument-layer-detail" aria-live="polite">
            <span key={focus}>{layers[focus].detail}</span>
          </span>
          <br />
          Drag to rotate, or use the arrow controls.
        </p>
      </div>
      <noscript>
        <style>{`.instrument-controls,.architecture-node,.architecture-focus{display:none!important}`}</style>
        <p className="instrument-nojs">
          A trust boundary separates a request from the resource it seeks.
        </p>
      </noscript>
    </div>
  );
}
