import { ArrowRight, ArrowUpRight, Layers3, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const paths = [
  {
    number: "01",
    icon: <Lightbulb size={21} />,
    title: "I’m new to Linux",
    copy: "Seven plain-language questions about how you use a computer. No jargon, no wrong answers.",
    link: "/quiz/newcomer",
    action: "Start the newcomer quiz",
    className: "newcomer",
  },
  {
    number: "02",
    icon: <Layers3 size={21} />,
    title: "I already use Linux",
    copy: "Direct technical questions about release models, package ecosystems and workflow.",
    link: "/quiz/experienced",
    action: "Start the experienced quiz",
    className: "experienced",
  },
];

/** The `/quiz` hub: pick an entry path that matches your experience. */
export default function QuizChooser() {
  return (
    <section className="quiz-chooser wrap" aria-labelledby="quiz-chooser-title">
      <div className="quiz-chooser-head">
        <div className="eyebrow muted">
          <span className="section-index">THE QUIZ /</span> TWO PATHS
        </div>
        <h1 id="quiz-chooser-title">
          Find your place
          <br /> in <em>Linux.</em>
        </h1>
        <p>
          Pick the path that matches where you’re starting from. Each one takes
          a couple of minutes and keeps your answers on this device only.
        </p>
      </div>
      <div className="path-grid">
        {paths.map((path) => (
          <Link
            className={`path-card ${path.className}`}
            to={path.link}
            key={path.link}
          >
            <div className="card-top">
              <span className="path-icon">{path.icon}</span>
              <span className="card-number">{path.number} / 02</span>
            </div>
            <div className="card-body">
              <h3>{path.title}</h3>
              <p>{path.copy}</p>
            </div>
            <div className="card-bottom">
              <span>{path.action}</span>
              <span className="arrow-circle">
                <ArrowUpRight size={19} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <p className="quiz-chooser-foot">
        Prefer to look around first?{" "}
        <Link to="/catalog">
          Browse all distros <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </p>
    </section>
  );
}
