import { ArrowRight, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  buildComparePath,
  MAX_COMPARISON_DISTROS,
  resolveCompareSelection,
} from "./catalog-state";
import { createCompareLinkState } from "../navigation/return-context";
import DistroMark from "../components/DistroMark";

/**
 * Sticky summary of the comparison selection. It stays visible while the
 * user scrolls results so the selection state and the "Compare" action are
 * always in reach; each chip removes that distro.
 */
export default function ComparisonTray({
  slugs,
  onRemove,
  onClear,
}: {
  slugs: readonly string[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  const location = useLocation();
  if (slugs.length === 0) {
    return null;
  }
  const { distros: selected, remaining } = resolveCompareSelection(slugs);

  return (
    <div className="comparison-tray" role="region" aria-label="Comparison selection">
      <div className="comparison-tray-inner wrap">
        <div className="comparison-tray-items">
          <span className="comparison-tray-label">
            Comparing {selected.length} of {MAX_COMPARISON_DISTROS}
          </span>
          <ul>
            {selected.map((distro) => (
              <li key={distro.slug}>
                <DistroMark distro={distro} size={22} />
                <span>{distro.name}</span>
                <button
                  type="button"
                  className="comparison-tray-remove"
                  onClick={() => onRemove(distro.slug)}
                >
                  <X size={13} aria-hidden="true" />
                  <span className="visually-hidden">
                    Remove {distro.name} from the comparison
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="comparison-tray-hint">
            {remaining > 0
              ? `Add ${remaining} more to compare side by side.`
              : "Selection full — remove one to swap."}
          </p>
        </div>
        <div className="comparison-tray-actions">
          <button type="button" className="quiz-start-over" onClick={onClear}>
            Clear
          </button>
          <Link
            className="button button-dark comparison-tray-cta"
            to={buildComparePath(slugs)}
            state={createCompareLinkState(location.search)}
          >
            {selected.length === 1
              ? "Open comparison"
              : `Compare ${selected.length} distros`}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
