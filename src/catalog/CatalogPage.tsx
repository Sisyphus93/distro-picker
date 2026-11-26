import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { createProfileLinkState } from "../navigation/return-context";
import CatalogToolbar from "./CatalogToolbar";
import ComparisonTray from "./ComparisonTray";
import DistroCard from "./DistroCard";
import {
  buildCatalogViewSearchParams,
  DEFAULT_CATALOG_VIEW_STATE,
  MAX_COMPARISON_DISTROS,
  removeCompareSlug,
  resolveCatalogView,
  toggleCompareSlug,
  type CatalogViewState,
} from "./catalog-state";

/**
 * The browsable catalog.
 *
 * View state (search, priorities, sort, comparison selection) lives in the
 * URL, so a filtered view can be linked or reloaded and returning from a
 * distro page restores the exact same results.
 */
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const profileLinkState = useMemo(
    () => createProfileLinkState("catalog", location.search),
    [location.search],
  );
  const {
    state,
    results,
    totalCount,
    hasFilters,
    comparisonFull,
    toolbarSummary,
  } = useMemo(() => resolveCatalogView(searchParams), [searchParams]);

  function update(next: CatalogViewState) {
    setSearchParams(buildCatalogViewSearchParams(next), { replace: true });
  }

  function toggleCompare(slug: string) {
    update({
      ...state,
      compare: toggleCompareSlug(state.compare, slug),
    });
  }

  function removeFromCompare(slug: string) {
    update({
      ...state,
      compare: removeCompareSlug(state.compare, slug),
    });
  }

  function clearFilters() {
    update({ ...state, search: "", priorities: [] });
  }

  return (
    <section className="catalog-page wrap" aria-labelledby="catalog-title">
      <div className="catalog-head">
        <div className="eyebrow muted">
          <span className="section-index">EXPLORE /</span> THE CURATED SET
        </div>
        <h1 id="catalog-title">
          Browse the distros<span className="green-dot">.</span>
        </h1>
        <p className="catalog-lede">
          Sixteen hand-picked distributions, rated on the same ten dimensions
          the quiz uses. Search by name, filter for what matters to you, and
          pick up to three to compare side by side.
        </p>
      </div>

      <CatalogToolbar
        state={state}
        resultCount={results.length}
        totalCount={totalCount}
        hasFilters={hasFilters}
        toolbarSummary={toolbarSummary}
        compareCount={state.compare.length}
        onChange={update}
        onClearFilters={clearFilters}
      />

      {comparisonFull ? (
        <p className="catalog-note catalog-note--full" role="status">
          Comparison is full ({MAX_COMPARISON_DISTROS} of{" "}
          {MAX_COMPARISON_DISTROS}). Remove one from the tray to swap in another
          distro.
        </p>
      ) : null}

      {results.length === 0 ? (
        <div className="catalog-empty">
          <SearchX size={26} aria-hidden="true" />
          <h2>Nothing matches yet.</h2>
          <p>
            Try a shorter search, drop a priority or two, or clear everything
            and start from the full set.
          </p>
          <button
            type="button"
            className="button button-dark"
            onClick={() =>
              update({ ...DEFAULT_CATALOG_VIEW_STATE, compare: state.compare })
            }
          >
            Show all distros
          </button>
        </div>
      ) : (
        <ul className="distro-grid" aria-label="Distro results">
          {results.map((distro) => (
            <li key={distro.slug}>
              <DistroCard
                distro={distro}
                compareSelected={state.compare.includes(distro.slug)}
                compareDisabled={
                  comparisonFull && !state.compare.includes(distro.slug)
                }
                onToggleCompare={() => toggleCompare(distro.slug)}
                profileLinkState={profileLinkState}
              />
            </li>
          ))}
        </ul>
      )}

      {hasFilters && results.length > 0 ? (
        <p className="catalog-note">
          Filtering by priorities follows the same 1–5 ratings used by the
          quiz and distro profiles — nothing is hidden silently.
        </p>
      ) : null}

      <ComparisonTray
        slugs={state.compare}
        onRemove={removeFromCompare}
        onClear={() => update({ ...state, compare: [] })}
      />
    </section>
  );
}
