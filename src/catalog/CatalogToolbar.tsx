import { Search, X } from "lucide-react";
import {
  CATALOG_SORTS,
  DIMENSIONS,
  getCatalogSort,
  getDimension,
  isCatalogSortId,
  PRIORITY_MATCH_MINIMUM,
  type DimensionId,
} from "../domain";
import { togglePriority, type CatalogViewState } from "./catalog-search";

function prioritySummary(priorities: readonly DimensionId[], threshold: number): string {
  if (priorities.length === 0) {
    return "";
  }
  const labels = priorities.map((id) => getDimension(id).shortLabel.toLowerCase());
  const list =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
  return `Showing distros rated ${threshold}+ for ${list}.`;
}

/**
 * Search, priority filters and sort. Priority filters use the shared
 * 10-dimension model: each picks a quality the distro must rate well on.
 * Everything here is a native, labelled control — no custom widgets needed.
 */
export default function CatalogToolbar({
  state,
  resultCount,
  totalCount,
  threshold,
  compareCount,
  onChange,
  onClearFilters,
}: {
  state: CatalogViewState;
  resultCount: number;
  totalCount: number;
  threshold: number;
  compareCount: number;
  onChange: (next: CatalogViewState) => void;
  onClearFilters: () => void;
}) {
  const hasFilters = state.search !== "" || state.priorities.length > 0;
  const summary = prioritySummary(state.priorities, threshold);

  return (
    <div className="catalog-toolbar">
      <div className="catalog-toolbar-row">
        <div className="catalog-search">
          <label className="catalog-field-label" htmlFor="catalog-search">
            Search by name
          </label>
          <div className="catalog-search-input">
            <Search size={16} aria-hidden="true" />
            <input
              id="catalog-search"
              type="search"
              value={state.search}
              onChange={(event) =>
                onChange({ ...state, search: event.target.value })
              }
              placeholder="Try “mint”, “arch” or “pop”"
              autoComplete="off"
              spellCheck={false}
            />
            {state.search ? (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => onChange({ ...state, search: "" })}
              >
                <X size={14} aria-hidden="true" />
                <span className="visually-hidden">Clear search</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="catalog-sort">
          <label className="catalog-field-label" htmlFor="catalog-sort">
            Sort by
          </label>
          <select
            id="catalog-sort"
            value={getCatalogSort(state.sort).id}
            onChange={(event) => {
              const value = event.target.value;
              if (isCatalogSortId(value)) {
                onChange({ ...state, sort: value });
              }
            }}
          >
            {CATALOG_SORTS.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>

        {/* Announces result counts as filters change, politely. */}
        <p className="catalog-count" role="status">
          <strong>{resultCount}</strong> of {totalCount} distros
          {compareCount > 0 ? ` · ${compareCount} selected to compare` : ""}
        </p>
      </div>

      <fieldset className="catalog-priorities">
        <legend className="catalog-field-label">
          Priorities — only show distros rated {threshold}+ on…
        </legend>
        <div className="catalog-priority-grid">
          {DIMENSIONS.map((dimension) => {
            const active = state.priorities.includes(dimension.id);
            return (
              <label
                key={dimension.id}
                className={`priority-chip${active ? " is-active" : ""}`}
                title={dimension.description}
              >
                <input
                  type="checkbox"
                  checked={active}
                  aria-label={`${dimension.shortLabel} priority`}
                  onChange={() =>
                    onChange({
                      ...state,
                      priorities: togglePriority(state.priorities, dimension.id),
                    })
                  }
                />
                <span className="priority-chip-mark" aria-hidden="true">
                  +
                </span>
                {dimension.shortLabel}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="catalog-toolbar-foot">
        <p className="catalog-summary">
          {hasFilters
            ? summary ||
              (state.search ? `Matching “${state.search}”.` : "")
            : `All ${totalCount} curated distros. Pick priorities or search to narrow.`}
        </p>
        {hasFilters ? (
          <button
            type="button"
            className="quiz-start-over"
            onClick={onClearFilters}
          >
            <X size={13} aria-hidden="true" /> Clear search & filters
          </button>
        ) : null}
      </div>
      <p className="catalog-priority-note">
        Priorities use the same ten dimensions as the quiz; every picked one
        must be rated {PRIORITY_MATCH_MINIMUM} or higher.
      </p>
    </div>
  );
}
