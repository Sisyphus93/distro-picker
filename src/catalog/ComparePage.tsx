import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import {
  DIMENSIONS,
  getDesktop,
  getDistrosBySlugs,
  getFamily,
  getReleaseModel,
  INSTALL_DIFFICULTY_LABELS,
  MAX_COMPARISON_DISTROS,
  type DistroProfile,
} from "../domain";
import DistroMark from "../components/DistroMark";
import { RatingPips } from "./DistroCard";
import { formatReviewedDate } from "./formatDate";
import { buildCatalogComparePath, buildCompareSearchParams, parseCompareSlugs } from "./compare-search";
import {
  buildProfileOrigin,
  profileOriginState,
  type ProfileOriginState,
} from "../navigation/profile-origin";

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

function DesktopCell({ distro }: { distro: DistroProfile }) {
  const desktops = distro.desktops.map(
    (desktopId) => getDesktop(desktopId).label,
  );
  return (
    <>
      <p className="compare-cell-main">
        {desktops.length > 0 ? desktops.join(", ") : "No default desktop"}
      </p>
      {distro.desktopNote ? (
        <p className="compare-cell-note">{distro.desktopNote}</p>
      ) : null}
    </>
  );
}

function ExpectCell({ distro }: { distro: DistroProfile }) {
  const expect = distro.whatToExpect;
  return (
    <dl className="compare-expect-list">
      <div>
        <dt>
          Install ({INSTALL_DIFFICULTY_LABELS[expect.installDifficulty]})
        </dt>
        <dd>{expect.install}</dd>
      </div>
      <div>
        <dt>Day-to-day maintenance</dt>
        <dd>{expect.maintenance}</dd>
      </div>
      <div>
        <dt>Getting software</dt>
        <dd>{expect.softwareInstall}</dd>
      </div>
      <div>
        <dt>Who feels at home</dt>
        <dd>{expect.whoWillFeelAtHome}</dd>
      </div>
    </dl>
  );
}

function OfficialLinksCell({
  distro,
  profileState,
}: {
  distro: DistroProfile;
  profileState: ProfileOriginState;
}) {
  const links = [
    { label: "Website", href: distro.links.website },
    { label: "Download", href: distro.links.download },
    { label: "Docs", href: distro.links.docs },
  ];
  return (
    <>
      <ul className="compare-official-links">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${distro.name} ${link.label.toLowerCase()} (opens in a new tab)`}
            >
              {link.label} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <Link
        className="text-link compare-profile-link"
        to={`/distros/${distro.slug}`}
        state={profileState}
      >
        View profile <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </>
  );
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const origin = location.state as { catalogSearch?: unknown; catalogScrollY?: unknown } | null;
  const catalogSearch = typeof origin?.catalogSearch === "string" ? origin.catalogSearch : "";
  const catalogScrollY = typeof origin?.catalogScrollY === "number" && Number.isFinite(origin.catalogScrollY)
    ? origin.catalogScrollY : undefined;
  const slugs = useMemo(
    () => parseCompareSlugs(searchParams),
    [searchParams],
  );
  const distros = useMemo(() => getDistrosBySlugs(slugs), [slugs]);

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

  const catalogPath = buildCatalogComparePath(slugs, catalogSearch);
  const catalogState = catalogScrollY === undefined ? undefined : { catalogScrollY };
  const profileState = profileOriginState(
    buildProfileOrigin("compare", location.search, {
      catalogSearch,
      catalogScrollY,
    }),
  );
  const remaining = MAX_COMPARISON_DISTROS - distros.length;

  function removeDistro(slug: string) {
    const next = slugs.filter((selected) => selected !== slug);
    setSearchParams(buildCompareSearchParams(next), { replace: true, state: location.state });
  }

  function clearSelection() {
    setSearchParams({}, { replace: true, state: location.state });
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
          <Link className="button button-dark" to={catalogPath} state={catalogState}>
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
          <Link className="button button-dark" to={catalogPath} state={catalogState}>
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
              <Link className="text-link" to={catalogPath} state={catalogState}>
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
                            state={profileState}
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
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <p className="compare-cell-main">
                        {getFamily(distro.family).label}
                      </p>
                      <p className="compare-cell-note">{distro.base}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Release model</span>
                  </th>
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <p className="compare-cell-main">
                        {getReleaseModel(distro.releaseModel).label}
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
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <DesktopCell distro={distro} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Best for</span>
                  </th>
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <StringList items={distro.bestFor} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Not ideal for</span>
                  </th>
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <StringList items={distro.notIdealFor} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Key tradeoffs</span>
                  </th>
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <StringList items={distro.tradeoffs} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">What to expect</span>
                  </th>
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <ExpectCell distro={distro} />
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
                  {distros.map((distro) => (
                    <td key={distro.slug}>
                      <OfficialLinksCell
                        distro={distro}
                        profileState={profileState}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="compare-row-head">
                    <span className="compare-row-label">Last reviewed</span>
                  </th>
                  {distros.map((distro) => (
                    <td key={distro.slug} className="compare-reviewed">
                      <time dateTime={distro.lastReviewed}>
                        {formatReviewedDate(distro.lastReviewed)}
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
