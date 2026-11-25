import { FIT_LABEL_MEANINGS, type FitLabel } from "../domain";

const FIT_BADGE_CLASS: Record<FitLabel, string> = {
  Strong: "fit-badge fit-badge--strong",
  Good: "fit-badge fit-badge--good",
  Partial: "fit-badge fit-badge--partial",
};

/**
 * The qualitative Strong/Good/Partial label shown on results and in the
 * methodology. The meaning is exposed as a tooltip for sighted users; results
 * pages also print it in full next to the badge.
 */
export default function FitBadge({ fit }: { fit: FitLabel }) {
  return (
    <span className={FIT_BADGE_CLASS[fit]} title={FIT_LABEL_MEANINGS[fit]}>
      {fit} fit
      <span className="visually-hidden">
        {" "}
        — {FIT_LABEL_MEANINGS[fit]}
      </span>
    </span>
  );
}
