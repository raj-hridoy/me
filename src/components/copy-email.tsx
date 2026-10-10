"use client";
import { useState } from "react";
import { site } from "@/data/site";
export function CopyEmail() {
  const [status, setStatus] = useState("");
  return (
    <div className="copy-email">
      <button
        className="button button-outline"
        data-copy-state={
          status === "Email copied to clipboard." ? "copied" : undefined
        }
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(site.email);
            setStatus("Email copied to clipboard.");
          } catch {
            setStatus(
              "Copy unavailable. Select the email above or use the email link.",
            );
          }
        }}
      >
        {status === "Email copied to clipboard." ? "Copied ✓" : "Copy email"}
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          {status === "Email copied to clipboard." ? (
            <path className="copy-check" d="m4 12 5 5L20 6" />
          ) : (
            <>
              <rect x="8" y="8" width="12" height="12" />
              <path d="M16 8V4H4v12h4" />
            </>
          )}
        </svg>
      </button>
      <p className="copy-feedback" role="status">
        {status}
      </p>
    </div>
  );
}
