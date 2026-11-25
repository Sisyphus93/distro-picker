import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Database,
  Layers3,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  DIMENSIONS,
  DISTROS,
  EXPERIENCED_QUIZ,
  FIT_LABEL_MEANINGS,
  FIT_LABELS,
  getFamily,
  NEWCOMER_QUIZ,
  SCORING_RULES,
  type DimensionMeta,
  type DistroProfile,
  type QuizFlow,
} from "../domain";
import DistroMark from "../components/DistroMark";
import FitBadge from "../components/FitBadge";
import { formatReviewedDate } from "../catalog/formatDate";

/**
 * "How we recommend": the one page that explains the shared model behind the
 * quiz, results, catalog, comparison and profiles.
 *
 * Everything here is derived from the domain data — dimensions, quiz flows,
 * fit labels, scoring rules, the curated set and each profile's review date —
 * so the explanation cannot quietly drift from the app it describes.
 */

const SECTIONS = [
  { id: "dimensions", label: "The ten dimensions" },
  { id: "quiz", label: "How answers map" },
  { id: "scoring", label: "How scoring works" },
  { id: "curation", label: "What we curate" },
  { id: "caveats", label: "Caveats & warnings" },
  { id: "limits", label: "Limits of v1" },
];

/** Every dimension a flow's answer options can actually express. */
function dimensionsTouched(flow: QuizFlow): DimensionMeta[] {
  const touched = new Set(
    flow.questions.flatMap((question) =>
      question.options.flatMap((option) =>
        option.targets.map((target) => target.dimension),
      ),
    ),
  );
  return DIMENSIONS.filter((dimension) => touched.has(dimension.id));
}

function neutralQuestionCount(flow: QuizFlow): number {
  return flow.questions.filter((question) => question.allowNotSure).length;
}

/** How current the curated set is, phrased for the page copy. */
function reviewWindowCopy(distros: readonly DistroProfile[]): string {
  const dates = distros.map((distro) => distro.lastReviewed).sort();
  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  if (earliest === latest) {
    return `every profile was last reviewed on ${formatReviewedDate(earliest)}`;
  }
  return `profiles were last reviewed between ${formatReviewedDate(
    earliest,
  )} and ${formatReviewedDate(latest)}`;
}

const CURATION_CRITERIA = [
  {
    title: "Actively maintained",
    body: "Each distro is still releasing updates and supported versions. Projects that stall or lose their maintainers get removed rather than left to go stale.",
  },
  {
    title: "A clear audience",
    body: "Every entry has a job: a gentle first distro, a stable workhorse, a rolling release, a gaming-first system, a privacy-first one. If we cannot say who it is for, it does not belong here.",
  },
  {
    title: "A reputable official channel",
    body: "Downloads and documentation come from the project itself, not from reupload sites. Every profile links to the official website, download page and docs.",
  },
  {
    title: "Broad relevance",
    body: "The set spans newcomers and experienced users, older laptops and new hardware, point releases and rolling models — enough range to make the quiz and comparison useful.",
  },
] as const;

const v1Limits = (distroCount: number) =>
  [
    "The dataset is manually curated and static in v1. It is not pulled from live package indexes, release feeds or telemetry.",
    `${distroCount} profiles is a deliberate slice of the Linux landscape, not a ranking of every distribution that exists.`,
    "Ratings are editorial judgements on a shared 1–5 scale. They are consistent with each other, but they are not benchmark results.",
    "Release dates, downloads and hardware notes can change after a profile's review date. Always confirm details on the distro's official site.",
    "Fit labels are qualitative. They compare your stated preferences with our ratings and never claim a measured probability.",
    "No accounts, no tracking and no saved profiles: quiz answers stay in this browser and nothing is sent to a server.",
  ] as const;

function FlowCard({
  flow,
  icon,
  action,
}: {
  flow: QuizFlow;
  icon: ReactNode;
  action: string;
}) {
  const dimensions = dimensionsTouched(flow);
  return (
    <article className="method-flow">
      <div className="method-flow-head">
        <span className="method-flow-icon">{icon}</span>
        <div>
          <h3>{flow.title}</h3>
          <p className="method-flow-meta">
            {flow.questions.length} questions ·{" "}
            {neutralQuestionCount(flow)} with a neutral option
          </p>
        </div>
      </div>
      <p className="method-flow-copy">{flow.intro}</p>
      <h4 className="method-subhead">
        Dimensions this path can speak to ({dimensions.length} of{" "}
        {DIMENSIONS.length})
      </h4>
      <ul className="method-chips" aria-label={`${flow.title} dimensions`}>
        {dimensions.map((dimension) => (
          <li key={dimension.id}>{dimension.shortLabel}</li>
        ))}
      </ul>
      <p className="method-flow-note">
        Answers are stored only in this browser.{" "}
        <Link to={`/quiz/${flow.audience}`}>
          {action} <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </p>
    </article>
  );
}

export default function MethodologyPage() {
  const caveated = DISTROS.filter((distro) => distro.caveat);
  const reviewCopy = reviewWindowCopy(DISTROS);

  return (
    <section className="method-page wrap" aria-labelledby="method-title">
      <header className="method-head">
        <div className="eyebrow muted">
          <span className="section-index">METHODOLOGY /</span> TRANSPARENT BY
          DEFAULT
        </div>
        <h1 id="method-title">
          How we recommend<span className="green-dot">.</span>
        </h1>
        <p className="method-lede">
          The quiz, the results, the catalog filters and the comparison table all
          run on one shared model:{" "}
          <strong>{DIMENSIONS.length} dimensions</strong>,{" "}
          <strong>{DISTROS.length} curated profiles</strong>, and ratings on a
          plain 1–5 scale. Here is exactly how an answer becomes a
          recommendation — and where v1 stops.
        </p>
        <p className="method-meta">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>
            Manually curated, static data · {DISTROS.length} distros ·{" "}
            {DIMENSIONS.length} dimensions · {reviewCopy}
          </span>
        </p>
      </header>

      <div className="method-layout">
        <nav className="method-toc" aria-labelledby="method-toc-title">
          <h2 id="method-toc-title">On this page</h2>
          <ol>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="method-content">
          <section
            className="method-section"
            id="dimensions"
            aria-labelledby="dimensions-title"
          >
            <h2 id="dimensions-title">
              The ten shared dimensions<span className="green-dot">.</span>
            </h2>
            <p className="method-lede method-lede--section">
              These are the questions we ask of every distro. A rating of 1 sits
              at the dimension's low end, a 5 at its high end, and a distro's
              profile carries a short rationale for every score.
            </p>
            <div
              className="method-table-scroll"
              role="region"
              aria-label="The ten shared dimensions"
              tabIndex={0}
            >
              <table className="method-table">
                <caption className="visually-hidden">
                  The ten shared dimensions, with what a high rating and the
                  1–5 scale mean
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Dimension</th>
                    <th scope="col">What a high rating means</th>
                    <th scope="col">The 1–5 scale</th>
                  </tr>
                </thead>
                <tbody>
                  {DIMENSIONS.map((dimension) => (
                    <tr className="method-dimension-row" key={dimension.id}>
                      <th scope="row">
                        <span className="method-dimension-label">
                          {dimension.label}
                        </span>
                        <span className="method-dimension-prompt">
                          {dimension.preferencePrompt}
                        </span>
                      </th>
                      <td>{dimension.description}</td>
                      <td>
                        <span className="method-scale">
                          <span>1 · {dimension.lowLabel}</span>
                          <span aria-hidden="true">→</span>
                          <span>5 · {dimension.highLabel}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            className="method-section"
            id="quiz"
            aria-labelledby="quiz-title"
          >
            <h2 id="quiz-title">
              Two paths, one model<span className="green-dot">.</span>
            </h2>
            <p className="method-lede method-lede--section">
              Newcomers get plain-language scenarios; experienced users get
              direct technical questions. Both flows answer into the same
              ten-dimension model, so a result is always explainable in the
              same terms.
            </p>
            <div className="method-flow-grid">
              <FlowCard
                flow={NEWCOMER_QUIZ}
                icon={<Lightbulb size={19} aria-hidden="true" />}
                action="Take the newcomer quiz"
              />
              <FlowCard
                flow={EXPERIENCED_QUIZ}
                icon={<Layers3 size={19} aria-hidden="true" />}
                action="Take the experienced quiz"
              />
            </div>
            <div className="method-callout">
              <ListChecks size={19} aria-hidden="true" />
              <div>
                <h3>What one answer carries</h3>
                <p>
                  Each answer option names one or more dimensions, the position
                  on the 1–5 scale it points to, and a weight of 1–3 for how
                  strongly it matters (nice to have, matters, strongly matters).
                  The engine reads that structure — there are no distro-specific
                  rules hidden in the quiz.
                </p>
                <p>
                  Choosing <strong>“I’m not sure”</strong> records no target at
                  all. That makes it a genuinely neutral answer: it neither helps
                  nor hurts any distro, and the same distro can rise later if you
                  change your mind.
                </p>
              </div>
            </div>
          </section>

          <section
            className="method-section"
            id="scoring"
            aria-labelledby="scoring-title"
          >
            <h2 id="scoring-title">
              Weighted, qualitative, explainable
              <span className="green-dot">.</span>
            </h2>
            <p className="method-lede method-lede--section">
              For every preference you state, we measure the distance between
              where you want a distro to sit and where it actually sits. Close
              preferences count as matches; wide gaps become tradeoffs. Weights
              decide how much each preference moves the final ordering.
            </p>
            <ol className="method-steps">
              <li>
                <strong>Compare positions.</strong> Both sides use the same 1–5
                scale, so the gap is just the difference between your ideal and
                the distro's rating.
              </li>
              <li>
                <strong>Apply the weight.</strong> Each preference carries a
                weight from 1 (nice to have) to 3 (strongly matters). Multiply
                the gap by the weight, add them up, then divide by the total
                weight to get a weighted average gap.
              </li>
              <li>
                <strong>Turn it into a label.</strong> A weighted average gap of{" "}
                {SCORING_RULES.strongThreshold} point or less earns a Strong fit;
                up to {SCORING_RULES.goodThreshold} points is Good; anything
                wider is Partial.
              </li>
              <li>
                <strong>Explain the result.</strong> Every dimension within{" "}
                {SCORING_RULES.matchGap} point of your ideal becomes a match
                reason with the distro's own rationale. Wider gaps become
                tradeoffs, and a gap of {SCORING_RULES.extremeGap} or more is
                called out as a warning.
              </li>
            </ol>
            <h3 className="method-subhead method-subhead--spaced">
              The three fit labels
            </h3>
            <dl className="method-fit-list">
              {FIT_LABELS.map((label) => (
                <div className="method-fit" key={label}>
                  <dt>
                    <FitBadge fit={label} />
                  </dt>
                  <dd>{FIT_LABEL_MEANINGS[label]}</dd>
                </div>
              ))}
            </dl>
            <div className="method-callout method-callout--quiet">
              <ShieldCheck size={19} aria-hidden="true" />
              <div>
                <h3>No percentages. No hard eliminations.</h3>
                <p>
                  A fit label is a summary of directional evidence, not a
                  measured probability — so we do not dress it up as one. Nor is
                  anything eliminated in v1: a distro that works against your
                  priorities can still rank, labelled and with its tradeoffs in
                  view. Ties keep the dataset's curated order rather than
                  inventing a winner.
                </p>
              </div>
            </div>
          </section>

          <section
            className="method-section"
            id="curation"
            aria-labelledby="curation-title"
          >
            <h2 id="curation-title">
              What we curate — and why<span className="green-dot">.</span>
            </h2>
            <p className="method-lede method-lede--section">
              The catalog holds {DISTROS.length} distributions, each chosen by
              hand. Inclusion is an editorial decision, and the bar is the same
              for every one of them.
            </p>
            <ul className="method-criteria">
              {CURATION_CRITERIA.map((criterion) => (
                <li key={criterion.title}>
                  <h3>{criterion.title}</h3>
                  <p>{criterion.body}</p>
                </li>
              ))}
            </ul>
            <h3 className="method-subhead method-subhead--spaced">
              The curated set
            </h3>
            <p className="method-scale-note">
              Every profile is manually curated and static in v1. Each one
              carries a <strong>Last reviewed</strong> date so you can judge how
              current it is — open a profile to see the date at the top, in the
              sidebar and in the catalog card.
            </p>
            <ul className="method-distro-list">
              {DISTROS.map((distro) => (
                <li className="method-distro" key={distro.slug}>
                  <DistroMark distro={distro} size={34} />
                  <div className="method-distro-text">
                    <Link to={`/distros/${distro.slug}`}>{distro.name}</Link>
                    <p>
                      {getFamily(distro.family).label} · {distro.base}
                    </p>
                  </div>
                  <p className="method-distro-review">
                    Last reviewed{" "}
                    <time dateTime={distro.lastReviewed}>
                      {formatReviewedDate(distro.lastReviewed)}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="method-section"
            id="caveats"
            aria-labelledby="caveats-title"
          >
            <h2 id="caveats-title">
              Caveat-heavy distros are labelled, not hidden
              <span className="green-dot">.</span>
            </h2>
            <p className="method-lede method-lede--section">
              Advanced or maintenance-heavy distros belong in the set — some
              people want exactly that. They are never quietly ranked first for a
              newcomer. Where a profile needs a warning, it carries a caveat,
              and the warning shows up wherever that distro appears.
            </p>
            <ul className="method-caveat-list">
              {caveated.map((distro) => (
                <li className="method-caveat" key={distro.slug}>
                  <div className="method-caveat-head">
                    <h3>
                      <Link to={`/distros/${distro.slug}`}>{distro.name}</Link>
                    </h3>
                    <span className="method-caveat-tag">
                      {distro.caveat?.mostRelevantTo === "newcomers"
                        ? "Newcomer caution"
                        : "Worth knowing"}
                    </span>
                  </div>
                  <p className="method-caveat-headline">
                    <TriangleAlert size={15} aria-hidden="true" />
                    {distro.caveat?.headline}
                  </p>
                  <p>{distro.caveat?.detail}</p>
                </li>
              ))}
            </ul>
            <p className="method-scale-note">
              Caveats appear as a headline on catalog cards, as a warning banner
              on the profile, and inside results when a distro's gaps or caveat
              affect the fit. An extreme mismatch also earns its own warning, so
              you are never surprised after the fact.
            </p>
          </section>

          <section
            className="method-section"
            id="limits"
            aria-labelledby="limits-title"
          >
            <h2 id="limits-title">
              What v1 is — and isn't<span className="green-dot">.</span>
            </h2>
            <p className="method-lede method-lede--section">
              Trust comes from being clear about the edges. This is a careful
              static guide, not a live release tracker or a benchmark suite.
            </p>
            <ul className="method-limits">
              {v1Limits(DISTROS.length).map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
            <div className="method-callout method-callout--quiet">
              <Database size={19} aria-hidden="true" />
              <div>
                <h3>How the data stays honest</h3>
                <p>
                  Profiles are reviewed by hand rather than scraped, and{" "}
                  {reviewCopy}. The dataset is validated on startup in
                  development, so a missing field or malformed quiz mapping fails
                  loudly instead of shipping. If you spot something that has
                  moved on, the official links on each profile are the source of
                  truth.
                </p>
              </div>
            </div>
          </section>

          <aside className="method-cta" aria-labelledby="method-cta-title">
            <div>
              <div className="eyebrow">
                <Compass size={14} aria-hidden="true" /> NEXT STEP
              </div>
              <h2 id="method-cta-title">See the model in action.</h2>
              <p>
                Answer a handful of questions and watch the reasons line up — or
                browse the same {DISTROS.length} profiles and compare them
                yourself.
              </p>
            </div>
            <div className="method-cta-actions">
              <Link className="button button-dark" to="/quiz">
                Find my distro <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="text-link" to="/catalog">
                Browse the catalog <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
