import { BoundarySculpture } from "./boundary-sculpture";
export function BoundaryArt({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`boundary-art${compact ? " compact" : ""}`}
      aria-hidden="true"
    >
      <BoundarySculpture separation={35} section={compact} />
    </div>
  );
}
