import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import {
  DIMENSIONS,
  type DistroProfile,
} from "../domain";
import DistroMark from "../components/DistroMark";
import {
  presentDistro,
  type PresentedDistro,
} from "../distros/distro-presentation";
import { RatingPips } from "./DistroCard";
import {
  buildCompareSearchParams,
  MAX_COMPARISON_DISTROS,
  removeCompareSlug,
  resolveCompareView,
} from "./catalog-state";
import { resolveCompareNavigation } from "../navigation/return-context";

/**
 * Side-by-side comparison of up to three distros.
 *
 * The selection lives in the URL (`?distros=slug,slug,slug`), parsed with
 * the same rules the catalog uses, so a comparison can be linked and
 * reloaded. Removing a distro here rewrites that URL and the "back to
 * catalog" link carries the narrowed selection as repeated `?compare=`
 * params, so returning to the catalog keeps exactly what remains.
 */

function StringList({ items }: { items: readonly string[] }) {
  return (
    <ul className="compare-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function DesktopCell({
  distro,
  presented,
}: {
  distro: DistroProfile;
  presented: PresentedDistro;
}) {
  return (
    <>
      <p className="compare-cell-main">{presented.desktopsLabel}</p>
      {distro.desktopNote ? (
        <p className="compare-cell-note">{distro.desktopNote}</p>
      ) : null}
    </>
  );
}

function ExpectCell({ presented }: { presented: PresentedDistro }) {
  return (
    <dl className="compare-expect-list">
      {presented.expectationFacts.map((fact) => (
        <div key={fact.id}>
          <dt>{fact.badge ? `${fact.label} (${fact.badge})` : fact.label}</dt>
          <dd>{fact.body}</dd>
        </div>
      ))}
    </dl>
  );
}

function OfficialLinksCell({
  presented,
  distro,
  profileLinkState,
}: {
  distro: DistroProfile;
  presented: PresentedDistro;
  profileLinkState: unknown;
}) {
  return (
    <>
      <ul className="compare-official-links">
        {presented.officialLinks.map((link) => (
          <li key={link.kind}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={link.ariaLabel}
            >
              {link.label} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <Link
        className="text-link compare-profile-link"
        to={`/distros/${distro.slug}`}
        state={profileLinkState}
      >
        View profile <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </>
  );
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { slugs, distros, remaining } = useMemo(
    () => resolveCompareView(searchParams),
    [searchParams],
  );
  const entries = useMemo(
    () => distros.map((distro) => ({ distro, presented: presentDistro(distro) })),
    [distros],
  );

  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousCountRef = useRef(distros.length);

  // Removing a distro unmounts the button that had focus; move focus to the
  // heading so keyboard users land somewhere predictable instead of the body.
  useEffect(() => {
    if (distros.length < previousCountRef.current) {
      headingRef.current?.focus();
    }
    previousCountRef.current = distros.length;
  }, [distros.length]);

  const nav = useMemo(
    () => resolveCompareNavigation(location.state, slugs, location.search),
    [location.state, slugs, location.search],
  );

  function removeDistro(slug: string) {
    setSearchParams(
      buildCompareSearchParams(removeCompareSlug(slugs, slug)),
      {
        replace: true,
        state: nav.preserveState,
      },
    );
  }

  function clearSelection() {
    setSearchParams(buildCompareSearchParams([]), {
      replace: true,
      state: nav.preserveState,
    });
  }

  return (
    <section className="compare-page wrap" aria-labelledby="compare-title">
      <div className="compare-head">
        <div className="eyebrow muted">
          <span className="section-index">COMPARE /</span> UP TO{" "}
          {MAX_COMPARISON_DISTROS} DISTROS
        </div>
        <h1 id="compare-title" ref={headingRef} tabIndex={-1}>
          Side-by-side comparison<span className="green-dot">.</span>
        </h1>
        <p className="compare-lede">
          The same profile fields and ten dimension ratings the quiz and
          catalog use — laid out so the tradeoffs are easy to scan. Pick up
          to three distros in the catalog and weigh them here.
        </p>
      </div>

      <div className="compare-toolbar">
        <p className="compare-status" role="status">
          Comparing <strong>{distros.length}</strong> of{" "}
          {MAX_COMPARISON_DISTROS} distros
          {distros.length > 0 && remaining > 0
            ? ` — room for ${remaining} more.`
            : distros.length > 0
              ? " — selection full."
              : "."}
        </p>
        <div className="compare-actions">
          <Link
            className="button button-dark"
            to={nav.catalogBackPath}
            state={nav.catalogBackState}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to catalog
          </Link>
          {distros.length > 0 ? (
            <button
              type="button"
              className="quiz-start-over"
              onClick={clearSelection}
            >
              Clear selection
            </button>
          ) : null}
        </div>
      </div>

      {distros.length === 0 ? (
        <div className="compare-empty">
          <h2>No distros selected yet.</h2>
          <p>
            Pick up to {MAX_COMPARISON_DISTROS} distros in the catalog — use
            the “Compare” toggle on any card — and they will appear here side
            by side.
          </p>
          <Link
            className="button button-dark"
            to={nav.catalogBackPath}
            state={nav.catalogBackState}
          >
            Browse the catalog <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <p className="compare-note">
            Removing a distro here updates your catalog selection too —
            returning to the catalog keeps the narrowed list. Add or swap
            distros there.
          </p>

          {distros.length === 1 ? (
            <p className="compare-single-note">
              Comparing one distro — add at least one more in the catalog to
              see the tradeoffs side by side.{" "}
              <Link
                className="text-link"
                to={nav.catalogBackPath}
                state={nav.catalogBackState}
              >
                Add more in the catalog <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </p>
          ) : null}

          <p className="compare-scale-note">
            Ratings run from 1 to 5 on every dimension — the same scale the
            quiz and catalog use. Each row shows what 1 and 5 mean for that
            dimension.
          </p>

          <p className="compare-scroll-hint">On smaller screens, scroll the table horizontally to compare every distro.</p>
          <div
            className="compare-table-scroll"
            role="region"
            aria-label="Distro comparison table"
            tabIndex={0}
          >
            <table className={`compare-table compare-table--${distros.length}`}>
              <caption className="visually-hidden">
                Side-by-side comparison of{" "}
                {distros.map((distro) => distro.name).join(", ")} across
                profile fields and ten dimension ratings from 1 to 5.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="compare-corner">
                    <span className="visually-hidden">Field</span>
                  </th>
                  {distros.map((distro) => (
                    <th
                      scope="col"
                      className="compare-distro-head"
                      key={distro.slug}
                    >
                      <div className="compare-distro-head-inner">
                        <DistroMark distro={distro} size={46} />
                        <div className="compare-distro-head-text">
                          <Link
                            className="compare-distro-name"
                            to={`/distros/${distro.slug}`}
                            state={nav.detailLinkState}
                          >
                            {distro.name}
                          </Link>
                          <p className="compare-distro-tagline">
                            {distro.tagline}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="compare-remove"
                          onClick={() => removeDistro(distro.slug)}
                          aria-label={`Remove ${distro.name} from comparison`}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr className="compare-section-row">
                  <th scope="rowgroup" colSpan={distros.length + 1}>
                    Profile
                  </th>
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Family &amp; base</span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug}>
                      <p className="compare-cell-main">
                        {presented.familyLabel}
                      </p>
                      <p className="compare-cell-note">{distro.base}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Release model</span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug}>
                      <p className="compare-cell-main">
                        {presented.releaseModelLabel}
                      </p>
                      <p className="compare-cell-note">
                        {distro.releaseNote}
                      </p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">
                      Default desktop(s)
                    </span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug}>
                      <DesktopCell distro={distro} presented={presented} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Best for</span>
                  </th>
                  {entries.map(({ distro }) => (
                    <td key={distro.slug}>
                      <StringList items={distro.bestFor} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Not ideal for</span>
                  </th>
                  {entries.map(({ distro }) => (
                    <td key={distro.slug}>
                      <StringList items={distro.notIdealFor} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Key tradeoffs</span>
                  </th>
                  {entries.map(({ distro }) => (
                    <td key={distro.slug}>
                      <StringList items={distro.tradeoffs} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Caveat</span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug} className="compare-caveat">
                      {presented.caveat ? (
                        <>
                          <p className="compare-caveat-tag">
                            {presented.caveat.audienceLabel}
                          </p>
                          <p className="compare-cell-main">
                            {presented.caveat.headline}
                          </p>
                          <p className="compare-cell-note">
                            {presented.caveat.detail}
                          </p>
                        </>
                      ) : (
                        <p className="compare-cell-note">
                          No specific caveat for this profile.
                        </p>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">What to expect</span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug}>
                      <ExpectCell presented={presented} />
                    </td>
                  ))}
                </tr>
              </tbody>

              <tbody>
                <tr className="compare-section-row">
                  <th scope="rowgroup" colSpan={distros.length + 1}>
                    Dimension ratings — 1 to 5
                  </th>
                </tr>
                {DIMENSIONS.map((dimension) => (
                  <tr key={dimension.id}>
                    <th scope="row" className="compare-row-head">
                      <span className="compare-row-label">
                        {dimension.label}
                      </span>
                      <span className="compare-row-scale">
                        1: {dimension.lowLabel} · 5: {dimension.highLabel}
                      </span>
                    </th>
                    {distros.map((distro) => {
                      const rating = distro.ratings[dimension.id];
                      return (
                        <td key={distro.slug} className="compare-rating-cell">
                          <div className="compare-rating-top">
                            <RatingPips
                              rating={rating.rating}
                              label={dimension.shortLabel}
                            />
                            <span
                              className="compare-rating-number"
                              aria-hidden="true"
                            >
                              {rating.rating}/5
                            </span>
                          </div>
                          <p className="compare-rationale">
                            {rating.rationale}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Official sources</span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug}>
                      <OfficialLinksCell
                        distro={distro}
                        presented={presented}
                        profileLinkState={nav.detailLinkState}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Last reviewed</span>
                  </th>
                  {entries.map(({ distro, presented }) => (
                    <td key={distro.slug} className="compare-reviewed">
                      <time dateTime={distro.lastReviewed}>
                        {presented.reviewedDateLabel}
                      </time>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
