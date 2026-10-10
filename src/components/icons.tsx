import type { SVGProps } from "react";
export function Arrow({
  diagonal = false,
  ...props
}: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      {...props}
    >
      {diagonal ? (
        <path d="M5 19 19 5M5 5h14v14" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}
export function Mark() {
  return (
    <svg
      className="brand-mark"
      width="64"
      height="48"
      viewBox="0 0 68 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="monogram-r"
        d="M4 40V8H26L34 16V25L26 31L36 40H25L15 30H12V40ZM12 16V23H23L26 20V18L23 16Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        className="monogram-h"
        d="M39 8H47V21H55V8H63V40H55V29H47V40H39Z"
        fill="currentColor"
      />
      <path d="M4 45h59" stroke="var(--accent)" strokeWidth="1" />
    </svg>
  );
}
