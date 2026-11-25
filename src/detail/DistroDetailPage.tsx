import { useMemo, type CSSProperties } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  Globe,
  TriangleAlert,
} from "lucide-react";
import {
  DIMENSIONS,
  DISTROS,
  getDesktop,
  getDistroBySlug,
  getFamily,
  getReleaseModel,
  INSTALL_DIFFICULTY_LABELS,
  type DistroProfile,
} from "../domain";
import DistroMark from "../components/DistroMark";
import { RatingPips } from "../catalog/DistroCard";
import { buildCatalogComparePath } from "../catalog/compare-search";
import { formatReviewedDate } from "../catalog/formatDate";
import {
  buildProfileOrigin,
  parseProfileOrigin,
  PROFILE_ORIGIN_LABELS,
  profileOriginState,
  readCatalogScrollY,
} from "../navigation/profile-origin";

/**
 * The full profile for one curated distro, read straight from the shared
 * dataset. Every section uses the same fields as the catalog, comparison and
 * results views; nothing here maintains a second copy of the data.
 *
 * The "back" link returns to the exact view the profile was opened from
 * (catalog search/filters/sort, results, comparison or home). Direct links
 * fall back to the unfiltered catalog.
 */

interface Caution {
  headline: string;
  detail: string;
  forNewcomers: boolean;
}

/** Advanced distros get newcomer-specific guidance even if data drifts. */
function getCaution(distro: DistroProfile): Caution | null {
  const easeRating = distro.ratings["ease-of-use"].rating;
  const forNewcomers =
    distro.caveat?.mostRelevantTo === "newcomers" || easeRating <= 2;
  if (!distro.caveat && !forNewcomers) {
    return null;
  }
  return {
    headline: distro.caveat?.headline ?? "More hands-on than most",
    detail:
      distro.caveat?.detail ??
      `Rated ${easeRating}/5 on ease of setup & use: expect to configure more yourself and to read documentation when something needs fixing.`,
    forNewcomers,
  };
}

function neighbouringDistros(distro: DistroProfile) {
  const index = DISTROS.findIndex((candidate) => candidate.slug === distro.slug);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }
  return {
    previous: DISTROS[(index - 1 + DISTROS.length) % DISTROS.length],
    next: DISTROS[(index + 1) % DISTROS.length],
  };
}

function Breadcrumbs({
  name,
  catalogPath,
  catalogState,
}: {
  name: string;
  catalogPath: string;
  catalogState?: unknown;
}) {
  return (
    <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to={catalogPath} state={catalogState}>
            Explore distros
          </Link>
        </li>
        <li aria-current="page">{name}</li>
      </ol>
    </nav>
  );
}

function StringList({
  title,
  items,
  variant,
}: {
  title: string;
  items: readonly string[];
  variant: "positive" | "negative" | "tradeoff";
}) {
  return (
    <article className="detail-panel">
      <h3>{title}</h3>
      <ul className={`detail-bullets detail-bullets--${variant}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function CautionBanner({ caution }: { caution: Caution }) {
  return (
    <aside
      className="detail-caution"
      role="note"
      aria-labelledby="detail-caution-title"
    >
      <TriangleAlert size={20} aria-hidden="true" />
      <div>
        <p className="detail-caution-kicker">
          {caution.forNewcomers
            ? "A heads-up for newcomers"
            : "Good to know before you start"}
        </p>
        <h2 id="detail-caution-title">{caution.headline}</h2>
        <p>{caution.detail}</p>
        {caution.forNewcomers ? (
          <p className="detail-caution-guidance">
            New to Linux? This one asks more of you than most.{" "}
            <Link to="/quiz/newcomer">Take the newcomer quiz</Link> or{" "}
            <Link to="/catalog">browse beginner-friendly distros</Link> first —
            you can always come back.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function AtAGlance({ distro }: { distro: DistroProfile }) {
  const desktops = distro.desktops.map((id) => getDesktop(id).label);
  return (
    <section className="detail-aside-card" aria-labelledby="detail-glance-title">
      <h2 id="detail-glance-title">At a glance</h2>
      <dl className="detail-facts">
        <div>
          <dt>Family &amp; base</dt>
          <dd>{getFamily(distro.family).label}</dd>
          <dd className="detail-fact-note">{distro.base}</dd>
        </div>
        <div>
          <dt>Release model</dt>
          <dd>{getReleaseModel(distro.releaseModel).label}</dd>
          <dd className="detail-fact-note">{distro.releaseNote}</dd>
        </div>
        <div>
          <dt>Default desktop(s)</dt>
          <dd>
            {desktops.length > 0 ? desktops.join(", ") : "No default desktop"}
          </dd>
          {distro.desktopNote ? (
            <dd className="detail-fact-note">{distro.desktopNote}</dd>
          ) : null}
        </div>
        <div>
          <dt>Install difficulty</dt>
          <dd>
            {INSTALL_DIFFICULTY_LABELS[distro.whatToExpect.installDifficulty]}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function OfficialSources({ distro }: { distro: DistroProfile }) {
  const links = [
    {
      label: "Website",
      href: distro.links.website,
      icon: <Globe size={15} aria-hidden="true" />,
    },
    {
      label: "Download",
      href: distro.links.download,
      icon: <Download size={15} aria-hidden="true" />,
    },
    {
      label: "Documentation",
      href: distro.links.docs,
      icon: <BookOpen size={15} aria-hidden="true" />,
    },
  ];
  return (
    <section
      className="detail-aside-card"
      aria-labelledby="detail-sources-title"
    >
      <h2 id="detail-sources-title">Official sources</h2>
      <ul className="detail-official-links">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${distro.name} ${link.label.toLowerCase()} (opens in a new tab)`}
            >
              <span className="detail-official-link-label">
                {link.icon}
                {link.label}
              </span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <p className="detail-reviewed">
        Last reviewed{" "}
        <time dateTime={distro.lastReviewed}>
          {formatReviewedDate(distro.lastReviewed)}
        </time>
      </p>
      <p className="detail-aside-note">
        Profiles are manually curated in v1.{" "}
        <Link to="/methodology">How we recommend</Link>
      </p>
    </section>
  );
}

function KeepExploring({ comparePath }: { comparePath: string }) {
  return (
    <section
      className="detail-aside-card"
      aria-labelledby="detail-explore-title"
    >
      <h2 id="detail-explore-title">Keep exploring</h2>
      <ul className="detail-quick-links">
        <li>
          <Link className="text-link" to="/catalog">
            Browse all {DISTROS.length} distros{" "}
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link className="text-link" to={comparePath}>
            Add to comparison <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link className="text-link" to="/results">
            My results <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link className="text-link" to="/quiz">
            Take the quiz <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </li>
      </ul>
    </section>
  );
}

function Ratings({ distro }: { distro: DistroProfile }) {
  return (
    <section className="detail-section" aria-labelledby="detail-ratings-title">
      <h2 id="detail-ratings-title">
        How it rates<span className="green-dot">.</span>
      </h2>
      <p className="detail-section-lede">
        All ten shared dimensions, rated 1–5 — the same scale the quiz, catalog
        and comparison use. A 1 sits at each dimension’s low end, a 5 at its
        high end. <Link to="/methodology">How we rate distros</Link>
      </p>
      <ul className="detail-ratings">
        {DIMENSIONS.map((dimension) => {
          const rated = distro.ratings[dimension.id];
          return (
            <li className="detail-rating" key={dimension.id}>
              <div className="detail-rating-head">
                <h3>{dimension.label}</h3>
                <div className="detail-rating-value">
                  <RatingPips
                    rating={rated.rating}
                    label={dimension.shortLabel}
                  />
                  <span className="detail-rating-number" aria-hidden="true">
                    {rated.rating}/5
                  </span>
                </div>
              </div>
              <p className="detail-rating-scale">
                <span>1: {dimension.lowLabel}</span>
                <span>5: {dimension.highLabel}</span>
              </p>
              <p className="detail-rationale">{rated.rationale}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function WhatToExpect({ distro }: { distro: DistroProfile }) {
  const expect = distro.whatToExpect;
  const items = [
    {
      title: "Installation",
      badge: INSTALL_DIFFICULTY_LABELS[expect.installDifficulty],
      body: expect.install,
    },
    { title: "Maintenance & updates", body: expect.maintenance },
    { title: "Installing software", body: expect.softwareInstall },
    { title: "Who feels at home", body: expect.whoWillFeelAtHome },
  ];
  return (
    <section className="detail-section" aria-labelledby="detail-expect-title">
      <h2 id="detail-expect-title">
        What to expect<span className="green-dot">.</span>
      </h2>
      <p className="detail-section-lede">
        What living with {distro.name} is actually like once it is installed.
      </p>
      <dl className="detail-expect-grid">
        {items.map((item) => (
          <div className="detail-expect-item" key={item.title}>
            <dt>
              {item.title}
              {item.badge ? (
                <span className="detail-difficulty">{item.badge}</span>
              ) : null}
            </dt>
            <dd>{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function DistroDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const distro = getDistroBySlug(slug ?? "");

  const origin = useMemo(
    () => parseProfileOrigin(location.state) ?? buildProfileOrigin("catalog"),
    [location.state],
  );
  const backState = useMemo(() => {
    if (origin.source === "compare") {
      return origin.compareContext;
    }
    if (origin.source === "catalog") {
      const scrollY = readCatalogScrollY();
      return scrollY === undefined ? undefined : { catalogScrollY: scrollY };
    }
    return undefined;
  }, [origin]);
  const catalogPath =
    origin.source === "catalog" ? origin.path : "/catalog";
  const profileState = profileOriginState(origin);

  if (!distro) {
    return (
      <section className="detail-page wrap" aria-labelledby="detail-missing-title">
        <Breadcrumbs
          name="Profile not found"
          catalogPath="/catalog"
        />
        <div className="detail-not-found">
          <div className="eyebrow muted">
            <span className="section-index">DISTRO PROFILE /</span> NOT FOUND
          </div>
          <h1 id="detail-missing-title">
            We don’t have that profile<span className="green-dot">.</span>
          </h1>
          <p>
            There is no curated profile for “{slug ?? "that distro"}”. All{" "}
            {DISTROS.length} distros are listed in the catalog.
          </p>
          <div className="placeholder-actions">
            <Link className="button button-dark" to="/catalog">
              Browse the catalog <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="text-link" to="/">
              Back to home <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const caution = getCaution(distro);
  const { previous, next } = neighbouringDistros(distro);
  const comparePath = buildCatalogComparePath([distro.slug]);
  const accentStyle = {
    "--detail-accent": distro.accent,
  } as CSSProperties;

  return (
    <section className="detail-page wrap" aria-labelledby="detail-title">
      <Breadcrumbs
        name={distro.name}
        catalogPath={catalogPath}
        catalogState={origin.source === "catalog" ? backState : undefined}
      />

      <header className="detail-hero" style={accentStyle}>
        <div className="eyebrow muted">
          <span className="section-index">DISTRO PROFILE /</span>{" "}
          {getFamily(distro.family).label.toUpperCase()}
        </div>
        <div className="detail-identity">
          <DistroMark distro={distro} size={76} />
          <div>
            <h1 id="detail-title">
              {distro.name}
              <span className="green-dot">.</span>
            </h1>
            <p className="detail-tagline">{distro.tagline}</p>
          </div>
        </div>
        <p className="detail-summary">{distro.summary}</p>
        <p className="detail-hero-meta">
          <span>
            {getReleaseModel(distro.releaseModel).label} ·{" "}
            {distro.desktops.length > 0
              ? distro.desktops.map((id) => getDesktop(id).label).join(", ")
              : "No default desktop"}
          </span>
          <span>
            Last reviewed{" "}
            <time dateTime={distro.lastReviewed}>
              {formatReviewedDate(distro.lastReviewed)}
            </time>
          </span>
        </p>
      </header>

      <div className="detail-toolbar">
        <Link className="button button-dark" to={origin.path} state={backState}>
          <ArrowLeft size={16} aria-hidden="true" />
          {PROFILE_ORIGIN_LABELS[origin.source]}
        </Link>
        <div className="detail-toolbar-links">
          <Link className="text-link" to="/catalog">
            All distros <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link className="text-link" to={comparePath}>
            Add to comparison <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link className="text-link" to="/">
            Home <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {caution ? <CautionBanner caution={caution} /> : null}

      <div className="detail-content">
        <div className="detail-main">
          <section className="detail-section" aria-labelledby="detail-fit-title">
            <h2 id="detail-fit-title">
              Where it fits<span className="green-dot">.</span>
            </h2>
            <p className="detail-section-lede">
              No distro is right for everyone. Here is where {distro.name}{" "}
              shines — and where it may disappoint.
            </p>
            <div className="detail-fit-grid">
              <StringList title="Best for" items={distro.bestFor} variant="positive" />
              <StringList
                title="Not ideal for"
                items={distro.notIdealFor}
                variant="negative"
              />
            </div>
            <StringList
              title="Key tradeoffs"
              items={distro.tradeoffs}
              variant="tradeoff"
            />
          </section>

          <Ratings distro={distro} />
          <WhatToExpect distro={distro} />
        </div>

        <aside className="detail-aside" aria-label={`${distro.name} quick facts`}>
          <AtAGlance distro={distro} />
          <OfficialSources distro={distro} />
          <KeepExploring comparePath={comparePath} />
        </aside>
      </div>

      <nav className="detail-more" aria-label="More distros">
        <h2>Keep looking around</h2>
        <div className="detail-more-links">
          {previous ? (
            <Link
              className="detail-more-link detail-more-link--previous"
              to={`/distros/${previous.slug}`}
              state={profileState}
              aria-label={`Previous distro: ${previous.name}`}
            >
              <DistroMark distro={previous} size={40} />
              <span>
                <span className="detail-more-label">
                  <ArrowLeft size={12} aria-hidden="true" /> Previous distro
                </span>
                <span className="detail-more-name">{previous.name}</span>
              </span>
            </Link>
          ) : null}
          {next ? (
            <Link
              className="detail-more-link detail-more-link--next"
              to={`/distros/${next.slug}`}
              state={profileState}
              aria-label={`Next distro: ${next.name}`}
            >
              <span>
                <span className="detail-more-label">
                  Next distro <ArrowRight size={12} aria-hidden="true" />
                </span>
                <span className="detail-more-name">{next.name}</span>
              </span>
              <DistroMark distro={next} size={40} />
            </Link>
          ) : null}
        </div>
        <p className="detail-more-all">
          <Link className="text-link" to="/catalog">
            Or browse the full catalog <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </p>
      </nav>
    </section>
  );
}
