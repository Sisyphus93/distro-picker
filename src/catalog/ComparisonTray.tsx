import { ArrowRight, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { buildComparePath } from "./compare-search";
import {
  getDistrosBySlugs,
  MAX_COMPARISON_DISTROS,
  type DistroProfile,
} from "../domain";
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
  const navigate = useNavigate();
  if (slugs.length === 0) {
    return null;
  }
  const selected: DistroProfile[] = getDistrosBySlugs(slugs);
  const remaining = MAX_COMPARISON_DISTROS - selected.length;

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
            state={{ catalogSearch: location.search }}
            onClick={(event) => {
              // Preserve the scroll position for ordinary in-app navigation;
              // modified clicks retain normal link behaviour.
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              navigate(buildComparePath(slugs), {
                state: { catalogSearch: location.search, catalogScrollY: window.scrollY },
              });
              window.scrollTo(0, 0);
            }}
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
