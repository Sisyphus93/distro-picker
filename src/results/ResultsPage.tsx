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
  FIT_LABEL_MEANINGS,
  type DistroProfile,
} from "../domain";
import DistroMark from "../components/DistroMark";
import FitBadge from "../components/FitBadge";
import {
  presentDistro,
  type PresentedOfficialLink,
} from "../distros/distro-presentation";
import { createProfileLinkState } from "../navigation/return-context";
import {
  clearQuizRun,
  loadCompletedQuizResults,
} from "../quiz/quiz-run";

function OfficialLinksRow({
  distro,
  officialLinks,
}: {
  distro: DistroProfile;
  officialLinks: readonly PresentedOfficialLink[];
}) {
  return (
    <div className="results-official-links" aria-label={`Official links for ${distro.name}`}>
      {officialLinks.map((link) => (
        <a
          key={link.kind}
          className="text-link"
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.ariaLabel}
        >
          {link.label} <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const profileState = createProfileLinkState("results", location.search);

  const completed = useMemo(() => loadCompletedQuizResults(), [location.key]);

  if (!completed) {
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

  const { flow, result } = completed;
  const top = result.topPick;
  const topPresented = presentDistro(top.distro);
  const topWarning = top.warning ?? null;
  const quizPath = `/quiz/${flow}`;
  const audienceLabel =
    flow === "newcomer" ? "NEW TO LINUX" : "ALREADY USE LINUX";

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
          traces back to something you told us.{" "}
          <Link to="/methodology">How we score</Link>.
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
              {top.matches.map((match) => (
                <li key={match.dimension}>{match.reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {top.tradeoffs.length > 0 ? (
          <div className="results-section">
            <h3>Worth knowing</h3>
            <ul className="results-tradeoffs">
              {top.tradeoffs.map((tradeoff) => (
                <li key={tradeoff}>{tradeoff}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="results-section">
          <h3>What to expect</h3>
          <dl className="results-expect-grid">
            {topPresented.expectationFacts.map((fact) => (
              <div className="results-expect-item" key={fact.id}>
                <dt>
                  {fact.badge ? `${fact.label} (${fact.badge})` : fact.label}
                </dt>
                <dd>{fact.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        {topWarning ? (
          <div className="results-warning" role="note">
            <TriangleAlert size={17} aria-hidden="true" />
            <p>{topWarning}</p>
          </div>
        ) : null}

        <div className="results-pick-actions">
          <Link
            className="button button-dark"
            to={`/distros/${top.distro.slug}`}
            state={profileState}
          >
            See {top.distro.name} in depth{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <OfficialLinksRow
            distro={top.distro}
            officialLinks={topPresented.officialLinks}
          />
        </div>
      </article>

      <div className="results-alternatives">
        <h2 className="results-alternatives-title">Two close alternatives</h2>
        <div className="results-alt-grid">
          {result.alternatives.map((alternative) => {
            const altPresented = presentDistro(alternative.distro);
            const altWarning = alternative.warning ?? null;
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
                      {alternative.matches.map((match) => (
                        <li key={match.dimension}>{match.reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {alternative.tradeoffs.length > 0 ? (
                  <div className="results-section results-section--compact">
                    <h4>Worth knowing</h4>
                    <ul className="results-tradeoffs">
                      {alternative.tradeoffs.map((tradeoff) => (
                        <li key={tradeoff}>{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="results-section results-section--compact">
                  <h4>What to expect</h4>
                  <p className="results-alt-expect">
                    <strong>
                      {altPresented.installDifficultyLabel} install:
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
                    state={profileState}
                  >
                    View profile <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  <OfficialLinksRow
                    distro={alternative.distro}
                    officialLinks={altPresented.officialLinks}
                  />
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
