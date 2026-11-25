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
  INSTALL_DIFFICULTY_LABELS,
  recommendDistros,
  type DistroProfile,
  type DistroRecommendation,
  type FitLabel,
} from "../domain";
import DistroMark from "../components/DistroMark";
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

function getCaveatMessage(
  rec: DistroRecommendation,
  flow: "newcomer" | "experienced",
): string | null {
  if (rec.warning) {
    return rec.warning;
  }
  const caveat = rec.distro.caveat;
  if (
    caveat &&
    (caveat.mostRelevantTo === "everyone" || flow === "newcomer")
  ) {
    return `${caveat.headline}: ${caveat.detail}`;
  }
  return null;
}

function OfficialLinksRow({ distro }: { distro: DistroProfile }) {
  return (
    <div className="results-official-links" aria-label={`Official links for ${distro.name}`}>
      <a
        className="text-link"
        href={distro.links.website}
        target="_blank"
        rel="noreferrer noopener"
      >
        Website <ArrowUpRight size={14} aria-hidden="true" />
      </a>
      <a
        className="text-link"
        href={distro.links.download}
        target="_blank"
        rel="noreferrer noopener"
      >
        Download <ArrowUpRight size={14} aria-hidden="true" />
      </a>
      <a
        className="text-link"
        href={distro.links.docs}
        target="_blank"
        rel="noreferrer noopener"
      >
        Docs <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

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
  const topWarning = getCaveatMessage(top, run.flow);
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

        <div className="results-section">
          <h3>What to expect</h3>
          <dl className="results-expect-grid">
            <div className="results-expect-item">
              <dt>
                Install ({INSTALL_DIFFICULTY_LABELS[top.distro.whatToExpect.installDifficulty]})
              </dt>
              <dd>{top.distro.whatToExpect.install}</dd>
            </div>
            <div className="results-expect-item">
              <dt>Day-to-day maintenance</dt>
              <dd>{top.distro.whatToExpect.maintenance}</dd>
            </div>
            <div className="results-expect-item">
              <dt>Getting software</dt>
              <dd>{top.distro.whatToExpect.softwareInstall}</dd>
            </div>
            <div className="results-expect-item">
              <dt>Who feels at home</dt>
              <dd>{top.distro.whatToExpect.whoWillFeelAtHome}</dd>
            </div>
          </dl>
        </div>

        {topWarning ? (
          <div className="results-warning" role="note">
            <TriangleAlert size={17} aria-hidden="true" />
            <p>{topWarning}</p>
          </div>
        ) : null}

        <div className="results-pick-actions">
          <Link className="button button-dark" to={`/distros/${top.distro.slug}`}>
            See {top.distro.name} in depth{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <OfficialLinksRow distro={top.distro} />
        </div>
      </article>

      <div className="results-alternatives">
        <h2 className="results-alternatives-title">Two close alternatives</h2>
        <div className="results-alt-grid">
          {result.alternatives.map((alternative) => {
            const altWarning = getCaveatMessage(alternative, run.flow);
            return (
              <article className="results-alt" key={alternative.distro.slug}>
                <div className="results-alt-head">
                  <DistroMark distro={alternative.distro} size={52} />
                  <div>
                    <h3>{alternative.distro.name}</h3>
                    <FitBadge fit={alternative.overallFit} />
                  </div>
                </div>
                <p className="results-alt-tagline">{alternative.distro.tagline}</p>

                {alternative.matches.length > 0 ? (
                  <div className="results-section results-section--compact">
                    <h4>Why this fits</h4>
                    <ul className="results-reasons">
                      {alternative.matches.slice(0, 3).map((match) => (
                        <li key={match.dimension}>{match.reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {alternative.tradeoffs.length > 0 ? (
                  <div className="results-section results-section--compact">
                    <h4>Worth knowing</h4>
                    <ul className="results-tradeoffs">
                      {alternative.tradeoffs.slice(0, 2).map((tradeoff) => (
                        <li key={tradeoff}>{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="results-section results-section--compact">
                  <h4>What to expect</h4>
                  <p className="results-alt-expect">
                    <strong>
                      {INSTALL_DIFFICULTY_LABELS[alternative.distro.whatToExpect.installDifficulty]} install:
                    </strong>{" "}
                    {alternative.distro.whatToExpect.install}{" "}
                    {alternative.distro.whatToExpect.whoWillFeelAtHome}
                  </p>
                </div>

                {altWarning ? (
                  <div className="results-warning results-warning--compact" role="note">
                    <TriangleAlert size={15} aria-hidden="true" />
                    <p>{altWarning}</p>
                  </div>
                ) : null}

                <div className="results-alt-footer">
                  <Link
                    className="text-link results-alt-link"
                    to={`/distros/${alternative.distro.slug}`}
                  >
                    View profile <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  <OfficialLinksRow distro={alternative.distro} />
                </div>
              </article>
            );
          })}
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
    </section>
  );
}
