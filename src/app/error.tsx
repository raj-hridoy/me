"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="container utility-state">
      <p className="eyebrow">An unexpected interruption</p>
      <h1>
        A signal
        <br />
        <span className="accent">was lost.</span>
      </h1>
      <p>
        Something interrupted this page. Try again, or return to the homepage.
      </p>
      <div className="hero-actions">
        <button className="button button-primary" onClick={reset}>
          Try again ↗
        </button>
        <Link className="text-link" href="/">
          Back to home ↗
        </Link>
      </div>
    </section>
  );
}
