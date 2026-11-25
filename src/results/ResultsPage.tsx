import { useMemo } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Compass,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import {
  buildPreferenceProfile,
  DISTROS,
  FIT_LABEL_MEANINGS,
  getQuizFlow,
  recommendDistros,
  type DistroProfile,
  type FitLabel,
} from "../domain";
import {
  clearQuizRun,
  loadLastQuizRun,
  parseStoredQuizRun,
} from "../quiz/quiz-run-store";

const FIT_BADGE_CLASS: Record<FitLabel, string> = {
  Strong: "fit-badge fit-badge--strong",
  Good: "fit-badge fit-badge--good",
  Partial: "fit-badge fit-badge--partial",
};

function FitBadge({ fit }: { fit: FitLabel }) {
  return (
    <span className={FIT_BADGE_CLASS[fit]} title={FIT_LABEL_MEANINGS[fit]}>
      {fit} fit
    </span>
  );
}

/** WCAG-ish relative luminance so monograms stay readable on any accent. */
function contrastOn(hex: string): string {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const channels = [0, 2, 4].map((offset) => {
    const raw = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  });
  if (channels.some((channel) => Number.isNaN(channel))) {
    return "#ffffff";
  }
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.4 ? "#17301f" : "#ffffff";
}

function DistroMark({
  distro,
  size,
}: {
  distro: DistroProfile;
  size: number;
}) {
  return (
    <span
      className="distro-mark"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        backgroundColor: distro.accent,
        color: contrastOn(distro.accent),
        borderRadius: Math.round(size * 0.22),
      }}
    >
      {distro.monogram}
    </span>
  );
}

/**
 * Interim results view. The full transparent breakdown (what to expect,
 * official links, tradeoffs in depth) lands with the results-page ticket;
 * for now the page proves the end-to-end path — stored answers in, engine
 * ranking out — and gives the user somewhere sensible to land.
 */
export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const run = useMemo(() => {
    const fromNav = parseStoredQuizRun(
      (location.state as { run?: unknown } | null)?.run,
    );
    return fromNav ?? loadLastQuizRun();
  }, [location.state]);

  const result = useMemo(() => {
    if (!run) {
      return null;
    }
    const flow = getQuizFlow(run.flow);
    const profile = buildPreferenceProfile(flow, run.answers);
    return recommendDistros(profile, DISTROS);
  }, [run]);

  if (!run || !result) {
    return (
      <section className="results-page wrap" aria-labelledby="results-empty-title">
        <div className="results-empty">
          <div className="results-empty-icon">
            <Compass size={26} aria-hidden="true" />
          </div>
          <div className="eyebrow muted">
            <span className="section-index">YOUR RESULTS /</span> NOTHING HERE YET
          </div>
          <h1 id="results-empty-title">
            No results yet<span className="green-dot">.</span>
          </h1>
          <p>
            Take the quick quiz first — it takes a couple of minutes, and your
            answers stay on this device.
          </p>
          <div className="results-empty-actions">
            <Link className="button button-dark" to="/quiz/newcomer">
              I’m new to Linux <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="text-link" to="/catalog">
              Or browse the catalog <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const top = result.topPick;
  const quizPath = `/quiz/${run.flow}`;
  const audienceLabel =
    run.flow === "newcomer" ? "NEW TO LINUX" : "ALREADY USE LINUX";

  function startFromScratch() {
    clearQuizRun();
    navigate(quizPath);
  }

  return (
    <section className="results-page wrap" aria-labelledby="results-title">
      <div className="results-head">
        <div className="eyebrow muted">
          <span className="section-index">YOUR RESULTS /</span> {audienceLabel}
        </div>
        <h1 id="results-title">
          Your starting point<span className="green-dot">.</span>
        </h1>
        <p className="results-lede">
          Based on your answers, here’s the distro we’d try first — and two
          close runners-up. No percentages, no black boxes: every reason below
          traces back to something you told us.
        </p>
      </div>

      <article className="results-pick" aria-labelledby="results-pick-name">
        <div className="results-pick-head">
          <DistroMark distro={top.distro} size={72} />
          <div className="results-pick-heading">
            <div className="results-pick-title-row">
              <h2 id="results-pick-name">{top.distro.name}</h2>
              <FitBadge fit={top.overallFit} />
            </div>
            <p className="results-pick-tagline">{top.distro.tagline}</p>
          </div>
        </div>
        <p className="results-fit-meaning">{FIT_LABEL_MEANINGS[top.overallFit]}</p>

        {top.matches.length > 0 ? (
          <div className="results-section">
            <h3>Why this fits</h3>
            <ul className="results-reasons">
              {top.matches.slice(0, 4).map((match) => (
                <li key={match.dimension}>{match.reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {top.tradeoffs.length > 0 ? (
          <div className="results-section">
            <h3>Worth knowing</h3>
            <ul className="results-tradeoffs">
              {top.tradeoffs.slice(0, 3).map((tradeoff) => (
                <li key={tradeoff}>{tradeoff}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {top.warning ? (
          <div className="results-warning" role="note">
            <TriangleAlert size={17} aria-hidden="true" />
            <p>{top.warning}</p>
          </div>
        ) : null}

        <div className="results-pick-actions">
          <Link className="button button-dark" to={`/distros/${top.distro.slug}`}>
            See {top.distro.name} in depth{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            className="text-link"
            href={top.distro.links.website}
            target="_blank"
            rel="noreferrer noopener"
          >
            Official website <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </article>

      <div className="results-alternatives">
        <h2 className="results-alternatives-title">Two close alternatives</h2>
        <div className="results-alt-grid">
          {result.alternatives.map((alternative) => (
            <article className="results-alt" key={alternative.distro.slug}>
              <div className="results-alt-head">
                <DistroMark distro={alternative.distro} size={52} />
                <div>
                  <h3>{alternative.distro.name}</h3>
                  <FitBadge fit={alternative.overallFit} />
                </div>
              </div>
              <p className="results-alt-tagline">{alternative.distro.tagline}</p>
              <Link
                className="text-link results-alt-link"
                to={`/distros/${alternative.distro.slug}`}
              >
                View profile <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="results-actions">
        <Link className="button button-dark" to={quizPath}>
          <ArrowLeft size={16} aria-hidden="true" /> Adjust my answers
        </Link>
        <button type="button" className="quiz-start-over" onClick={startFromScratch}>
          <RotateCcw size={13} aria-hidden="true" /> Start from scratch
        </button>
        <Link className="text-link" to="/catalog">
          Browse the catalog <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <p className="results-interim-note">
        A first look, generated from your answers. The detailed results
        experience — what to expect from each pick and deeper tradeoffs — is
        coming soon.
      </p>
    </section>
  );
}
