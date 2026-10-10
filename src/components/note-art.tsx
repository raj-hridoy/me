/** Original angular studies: ownership, a bound round trip, and traced data. */
export function NoteArt({
  type,
}: {
  type: "authorization" | "oauth" | "code";
}) {
  return (
    <svg
      className={`note-art ${type}`}
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="var(--platinum)" strokeWidth=".6" opacity=".18">
        <path d="M0 150h400M200 0v300" strokeDasharray="2 6" />
        <path d="M30 55V30h25M345 30h25v25M30 245v25h25M345 270h25v-25" />
      </g>
      <g stroke="currentColor" strokeWidth=".85">
        {type === "authorization" ? (
          <>
            {Array.from({ length: 18 }, (_, i) => (
              <path
                key={i}
                opacity={0.25 + i / 30}
                d={`M75 ${106 + i * 4.5} 200 ${48 + i * 4.5} 325 ${106 + i * 4.5} 200 ${164 + i * 4.5}Z`}
                fill="var(--surface)"
                fillOpacity=".24"
              />
            ))}
            <path
              d="M200 38 247 62 247 243 200 267 153 243 153 62Z"
              fill="var(--accent)"
              fillOpacity=".09"
              stroke="var(--accent-bright)"
            />
            <path
              d="M45 150H355M200 22v256"
              strokeDasharray="2 5"
              stroke="var(--accent-bright)"
              opacity=".7"
            />
            <rect
              x="195"
              y="145"
              width="10"
              height="10"
              fill="var(--accent-bright)"
            />
          </>
        ) : type === "oauth" ? (
          <>
            {[0, 1].map((side) => (
              <g key={side}>
                {Array.from({ length: 12 }, (_, i) => (
                  <path
                    key={i}
                    opacity={0.2 + i / 24}
                    d={`M${68 + side * 172 + i * 2} ${67 + i * 3}h86v108h-86Z`}
                  />
                ))}
                <rect
                  x={104 + side * 172}
                  y="121"
                  width="21"
                  height="42"
                  fill="var(--accent)"
                  fillOpacity=".18"
                  stroke="var(--accent-bright)"
                />
              </g>
            ))}
            <path
              className="note-route"
              d="M115 66V40H285V63m-6-6 6 6 6-6M285 208v45H115v-45m-6 6 6-6 6 6"
              stroke="var(--accent-bright)"
              strokeWidth="1.3"
            />
            <path d="M142 145h100" strokeDasharray="3 5" />
            <rect
              x="190"
              y="135"
              width="20"
              height="20"
              stroke="var(--platinum)"
            />
          </>
        ) : (
          <>
            {Array.from({ length: 16 }, (_, i) => (
              <path
                key={i}
                opacity={0.25 + i / 25}
                d={`M35 ${57 + i * 12}H${95 + i * 2}L${165 + i * 2} ${93 + i * 7.5}H${235 + i * 2}L${305 + i} ${57 + i * 12}H365`}
              />
            ))}
            <path
              d="M179 28h42v244h-42Z"
              fill="var(--accent)"
              fillOpacity=".12"
              stroke="var(--accent-bright)"
            />
            <path
              d="m74 132-20 18 20 18m252-36 20 18-20 18M208 114l-16 72"
              stroke="var(--accent-bright)"
              strokeWidth="1.5"
            />
            <rect x="197" y="147" width="6" height="6" fill="var(--platinum)" />
          </>
        )}
      </g>
      <g
        fill="var(--platinum)"
        fontFamily="monospace"
        fontSize="6"
        letterSpacing="1"
      >
        <text x="20" y="283">
          {type === "authorization"
            ? "01 / IDENTITY ≠ PERMISSION"
            : type === "oauth"
              ? "02 / A RESPONSE BOUND TO A REQUEST"
              : "03 / INPUT → DECISION → OPERATION"}
        </text>
        <text x="370" y="25" textAnchor="end">
          RH / BOUNDARY STUDY
        </text>
      </g>
    </svg>
  );
}
