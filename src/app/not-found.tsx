import Link from "next/link";
import { BoundaryArt } from "@/components/boundary-art";
import { Arrow } from "@/components/icons";
export default function NotFound() {
  return (
    <section className="container not-found">
      <div>
        <p className="eyebrow">404 / Beyond this boundary</p>
        <h1>
          This path
          <br />
          <span className="accent">ends here.</span>
        </h1>
        <p>
          The page you’re looking for doesn’t exist.
          <br />
          There are other boundaries to explore.
        </p>
        <Link className="button button-primary" href="/">
          Back to home
          <Arrow />
        </Link>
      </div>
      <BoundaryArt compact />
    </section>
  );
}
