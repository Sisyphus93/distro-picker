import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { getDistrosBySlugs, MAX_COMPARISON_DISTROS } from "../domain";
import DistroMark from "../components/DistroMark";

/**
 * Interim destination for the catalog's comparison action. The side-by-side
 * table arrives with ticket 08; this page confirms the selection survives
 * navigation and stays reachable from the catalog.
 */
export default function CompareStubPage() {
  const [searchParams] = useSearchParams();
  const slugs = searchParams
    .getAll("distros")
    .flatMap((value) => value.split(","))
    .filter(Boolean);
  const distros = getDistrosBySlugs(slugs);

  return (
    <section className="compare-stub wrap" aria-labelledby="compare-title">
      <div className="eyebrow muted">
        <span className="section-index">COMPARE /</span> UP TO{" "}
        {MAX_COMPARISON_DISTROS} DISTROS
      </div>
      <h1 id="compare-title">
        Side-by-side comparison<span className="green-dot">.</span>
      </h1>
      <p className="compare-stub-lede">
        The full comparison table — profile fields and all ten dimension
        ratings, side by side — is the next thing being built. Your selection
        is kept, so nothing has to be picked again.
      </p>

      {distros.length > 0 ? (
        <ul className="compare-stub-selection" aria-label="Selected distros">
          {distros.map((distro) => (
            <li key={distro.slug}>
              <DistroMark distro={distro} size={34} />
              <span>{distro.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="compare-stub-empty">
          No distros selected yet — pick up to {MAX_COMPARISON_DISTROS} from
          the catalog to compare them.
        </p>
      )}

      <div className="compare-stub-actions">
        <Link className="button button-dark" to="/catalog">
          <ArrowLeft size={16} aria-hidden="true" /> Back to the catalog
        </Link>
        <p>
          Returning to the catalog keeps your search, filters and selection
          exactly as you left them.
        </p>
      </div>
    </section>
  );
}
