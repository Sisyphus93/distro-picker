import { useEffect, useLayoutEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import {
  DISTROS,
  MAX_COMPARISON_DISTROS,
  PRIORITY_MATCH_MINIMUM,
  queryCatalog,
  toggleComparisonSelection,
} from "../domain";
import {
  buildProfileOrigin,
  rememberCatalogScrollY,
} from "../navigation/profile-origin";
import CatalogToolbar from "./CatalogToolbar";
import ComparisonTray from "./ComparisonTray";
import DistroCard from "./DistroCard";
import {
  buildCatalogViewSearchParams,
  DEFAULT_CATALOG_VIEW_STATE,
  parseCatalogViewState,
  type CatalogViewState,
} from "./catalog-search";

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
  useLayoutEffect(() => {
    const scrollY = (location.state as { catalogScrollY?: unknown } | null)?.catalogScrollY;
    if (typeof scrollY === "number" && Number.isFinite(scrollY) && scrollY >= 0) {
      window.scrollTo(0, scrollY);
    }
    // Restore only when the catalog mounts, not on each filter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track the latest scroll position so a profile's "back" link can restore
  // it. Tracking scroll events (rather than capturing at render) keeps it
  // accurate, since scrolling alone does not re-render this page.
  useEffect(() => {
    const remember = () => rememberCatalogScrollY(window.scrollY);
    remember();
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, []);

  const profileOrigin = useMemo(
    () => buildProfileOrigin("catalog", location.search),
    [location.search],
  );
  const state = useMemo(
    () => parseCatalogViewState(searchParams),
    [searchParams],
  );

  const results = useMemo(
    () =>
      queryCatalog(DISTROS, {
        search: state.search,
        priorities: state.priorities,
        sort: state.sort,
      }),
    [state.search, state.priorities, state.sort],
  );

  const hasFilters = state.search !== "" || state.priorities.length > 0;
  const comparisonFull = state.compare.length >= MAX_COMPARISON_DISTROS;

  function update(next: CatalogViewState) {
    setSearchParams(buildCatalogViewSearchParams(next), { replace: true });
  }

  function toggleCompare(slug: string) {
    update({
      ...state,
      compare: toggleComparisonSelection(state.compare, slug),
    });
  }

  /** Removing from the tray never adds, so plain filtering is the right move. */
  function removeFromCompare(slug: string) {
    update({
      ...state,
      compare: state.compare.filter((selected) => selected !== slug),
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
        totalCount={DISTROS.length}
        threshold={PRIORITY_MATCH_MINIMUM}
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
                  state.compare.length >= MAX_COMPARISON_DISTROS &&
                  !state.compare.includes(distro.slug)
                }
                onToggleCompare={() => toggleCompare(distro.slug)}
                profileOrigin={profileOrigin}
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
