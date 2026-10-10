"use client";
import { useLinkStatus } from "next/link";
export function NavigationProgress() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="nav-loading" role="status">
      <span className="sr-only">Opening page…</span>
    </span>
  ) : null;
}
