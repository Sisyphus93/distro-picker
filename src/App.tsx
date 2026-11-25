import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Layers3,
  Lightbulb,
  Route,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import {
  Link,
  NavLink,
  Route as PageRoute,
  Routes,
  useLocation,
} from "react-router-dom";
import { DISTROS, EXPERIENCED_QUIZ, NEWCOMER_QUIZ } from "./domain";
import QuizChooser from "./quiz/QuizChooser";
import QuizPage from "./quiz/QuizPage";
import ResultsPage from "./results/ResultsPage";
import CatalogPage from "./catalog/CatalogPage";
import ComparePage from "./catalog/ComparePage";
import DistroDetailPage from "./detail/DistroDetailPage";
import MethodologyPage from "./methodology/MethodologyPage";
import { titleForPath } from "./navigation/document-title";

/** Keeps the browser tab in step with the current route. */
function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);
  return null;
}

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Distro Picker home">
      <span className="brand-mark">
        <Compass size={21} strokeWidth={1.8} />
      </span>
      <span>
        distro<span className="brand-light">picker</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/catalog">Explore distros</NavLink>
          <NavLink to="/methodology">How we recommend</NavLink>
        </nav>
        <Link className="header-cta" to="/quiz">
          Find my distro <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div>
          <Brand />
          <p>A little clarity for your Linux journey.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/catalog">Explore distros</Link>
          <Link to="/methodology">How we recommend</Link>
          <Link to="/quiz">Take the quiz</Link>
          <Link to="/results">Results</Link>
        </nav>
        <p className="footer-note">Made for the curious, wherever you begin.</p>
      </div>
    </footer>
  );
}

function CompassArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-top">
        <span>YOUR LINUX JOURNEY</span>
        <span>✳</span>
      </div>
      <div className="orbit orbit-outer">
        <div className="orbit orbit-inner">
          <div className="compass-rose">
            <div className="rose-axis" />
            <div className="rose-point rose-north" />
            <div className="rose-point rose-south" />
            <div className="rose-center" />
          </div>
        </div>
      </div>
      <span className="art-direction north">N</span>
      <span className="art-direction east">E</span>
      <span className="art-direction south">S</span>
      <span className="art-direction west">W</span>
      <div className="art-label art-label-one">
        <span className="label-icon">
          <Sparkles size={15} />
        </span>
        <span>
          Made for <b>your needs</b>
        </span>
      </div>
      <div className="art-label art-label-two">
        <span className="label-icon light">
          <Check size={15} />
        </span>
        <span>
          A clearer <b>starting point</b>
        </span>
      </div>
      <div className="art-bottom">
        <span>LESS GUESSWORK</span>
        <span>MORE POSSIBILITY ↗</span>
      </div>
    </div>
  );
}

const paths = [
  {
    number: "01",
    icon: <Lightbulb size={21} />,
    title: "I’m new to Linux",
    copy: "Start with the basics. We’ll help you find a friendly place to begin.",
    link: "/quiz/newcomer",
    action: "Find my starting point",
    className: "newcomer",
  },
  {
    number: "02",
    icon: <Layers3 size={21} />,
    title: "I already use Linux",
    copy: "Know what you like? Let’s find a distro that fits the way you work.",
    link: "/quiz/experienced",
    action: "Find my fit",
    className: "experienced",
  },
];

function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A BETTER WAY TO CHOOSE LINUX
          </div>
          <h1>
            Find your place
            <br />
            in <em>Linux.</em>
          </h1>
          <p className="hero-description">
            There’s a Linux distro for everyone. Let’s find the one that feels
            right for you.
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="#choose-path">
              Find your distro <ArrowDown size={17} />
            </a>
            <Link className="text-link" to="/catalog">
              Or explore the catalog <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="tiny-stars" aria-hidden="true">✳</span> A little
            guidance goes a long way.
          </div>
        </div>
        <CompassArt />
      </section>
      <section className="path-section" id="choose-path">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">
                <span className="section-index">01 /</span> LET’S GET STARTED
              </div>
              <h2>
                Choose your path<span className="green-dot">.</span>
              </h2>
            </div>
            <p>
              New here or know your way around?
              <br />
              There’s a starting point for you.
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
          <div className="browse-line">
            <span>Prefer to look around on your own?</span>
            <Link to="/catalog">
              Browse all distros <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="why-section wrap">
        <div className="why-intro">
          <div className="eyebrow muted">
            <span className="section-index">02 /</span> A LITTLE LESS
            OVERWHELMING
          </div>
          <h2>
            More clarity.
            <br />
            <em>Less choice paralysis.</em>
          </h2>
          <p>
            Choosing an operating system shouldn’t feel like a leap into the
            unknown. We’re here to make the options make sense.
          </p>
          <Link className="text-link" to="/methodology">
            How we recommend <ArrowRight size={16} />
          </Link>
        </div>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">
              <Route size={20} />
            </span>
            <div>
              <h3>Start where you are</h3>
              <p>
                Whether it’s your first time or your fiftieth install, there’s a
                path for you.
              </p>
            </div>
            <span className="feature-number">01</span>
          </div>
          <div className="feature">
            <span className="feature-icon">
              <Sparkles size={20} />
            </span>
            <div>
              <h3>Find what fits</h3>
              <p>
                Think about what matters to you, from everyday ease to room to
                tinker.
              </p>
            </div>
            <span className="feature-number">02</span>
          </div>
          <div className="feature">
            <span className="feature-icon">
              <BookOpen size={20} />
            </span>
            <div>
              <h3>Understand your options</h3>
              <p>
                Get a clearer picture of the strengths and tradeoffs behind each
                choice.
              </p>
            </div>
            <span className="feature-number">03</span>
          </div>
        </div>
      </section>
      <section className="bottom-banner wrap">
        <div>
          <span className="banner-kicker">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Curious? You’re in the right place.</h2>
          <p>There’s no one-size-fits-all in Linux. That’s the good part.</p>
        </div>
        <a className="button button-light" href="#choose-path">
          Let’s find your fit <ArrowUpRight size={17} />
        </a>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="placeholder wrap" aria-labelledby="not-found-title">
      <div className="eyebrow muted">
        <span className="section-index">DISTRO PICKER /</span> PAGE NOT FOUND
      </div>
      <h1 id="not-found-title">
        Page not found<span className="green-dot">.</span>
      </h1>
      <p>
        We couldn’t find that page — but the {DISTROS.length} curated distros,
        the quiz and the methodology explainer are all still here.
      </p>
      <div className="placeholder-actions">
        <Link className="button button-dark" to="/">
          Back to home <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <Link className="text-link" to="/catalog">
          Explore distros <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link className="text-link" to="/methodology">
          How we recommend <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <DocumentTitle />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <PageRoute path="/" element={<Home />} />
          <PageRoute path="/quiz" element={<QuizChooser />} />
          <PageRoute
            path="/quiz/newcomer"
            element={<QuizPage flow={NEWCOMER_QUIZ} />}
          />
          <PageRoute
            path="/quiz/experienced"
            element={<QuizPage flow={EXPERIENCED_QUIZ} />}
          />
          <PageRoute path="/results" element={<ResultsPage />} />
          <PageRoute path="/catalog" element={<CatalogPage />} />
          <PageRoute path="/compare" element={<ComparePage />} />
          <PageRoute path="/distros/:slug" element={<DistroDetailPage />} />
          <PageRoute path="/methodology" element={<MethodologyPage />} />
          <PageRoute path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
