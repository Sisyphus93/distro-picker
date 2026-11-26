import { Link } from "react-router-dom";
import { topStrengths, type DistroProfile } from "../domain";
import DistroMark from "../components/DistroMark";
import { presentDistro } from "../distros/distro-presentation";
import { MAX_COMPARISON_DISTROS } from "./catalog-state";

/**
 * Accessible 1–5 rating pips for a single dimension. The numeric value is
 * exposed as text so screen readers do not depend on the dots.
 */
export function RatingPips({
  rating,
  label,
}: {
  rating: number;
  label: string;
}) {
  return (
    <span className="rating-pips">
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={`rating-pip${step <= rating ? " is-on" : ""}`}
          aria-hidden="true"
        />
      ))}
      <span className="visually-hidden">
        {label}: {rating} of 5
      </span>
    </span>
  );
}

/**
 * The compare toggle on a catalog result. When the selection is full and
 * this distro is not part of it, the control is disabled and the title
 * explains why.
 */
export function CompareToggle({
  distro,
  checked,
  disabled,
  onChange,
}: {
  distro: DistroProfile;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`compare-toggle${checked ? " is-checked" : ""}${
        disabled ? " is-disabled" : ""
      }`}
      title={
        disabled
          ? `Compare up to ${MAX_COMPARISON_DISTROS} distros at once. Remove one to add ${distro.name}.`
          : checked
            ? `Remove ${distro.name} from the comparison`
            : `Add ${distro.name} to the comparison`
      }
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={
          checked
            ? `Remove ${distro.name} from comparison`
            : `Add ${distro.name} to comparison`
        }
      />
      <span className="compare-toggle-box" aria-hidden="true">
        ✓
      </span>
      <span className="compare-toggle-text" aria-hidden="true">
        {checked ? "In comparison" : "Compare"}
      </span>
    </label>
  );
}

/** Compact one-line summary of a distro's release context for a card. */
export function DistroContextLine({ distro }: { distro: DistroProfile }) {
  const presented = presentDistro(distro);
  return (
    <div className="distro-card-facts">
      <p className="distro-card-context">
        <span>{presented.familyLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{distro.base}</span>
        <span aria-hidden="true">·</span>
        <span>{presented.releaseModelLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{presented.desktopsLabel}</span>
      </p>
      <p className="distro-card-reviewed">
        Reviewed{" "}
        <time dateTime={distro.lastReviewed}>
          {presented.reviewedDateLabel}
        </time>
      </p>
    </div>
  );
}

/**
 * A single catalog result: identity, context, notable strengths, its caveat
 * headline (if any), and the controls that matter at browse time — the
 * profile link and the comparison toggle.
 */
export default function DistroCard({
  distro,
  compareSelected,
  compareDisabled,
  onToggleCompare,
  profileLinkState,
}: {
  distro: DistroProfile;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
  /** Validated navigation return context so "back" restores this catalog view. */
  profileLinkState: unknown;
}) {
  const strengths = topStrengths(distro);
  const { caveat } = presentDistro(distro);
  const profilePath = `/distros/${distro.slug}`;

  return (
    <article
      className={`distro-card${compareSelected ? " is-compared" : ""}`}
      aria-labelledby={`distro-${distro.slug}-name`}
    >
      <div className="distro-card-head">
        <DistroMark distro={distro} size={46} />
        <div className="distro-card-heading">
          <h3 id={`distro-${distro.slug}-name`}>
            <Link to={profilePath} state={profileLinkState}>
              {distro.name}
            </Link>
          </h3>
          <p className="distro-card-tagline">{distro.tagline}</p>
        </div>
      </div>

      <DistroContextLine distro={distro} />

      {strengths.length > 0 ? (
        <ul
          className="distro-card-chips"
          aria-label={`Notable strengths of ${distro.name}`}
        >
          {strengths.map((strength) => (
            <li key={strength.dimension.id}>
              <RatingPips
                rating={strength.rating}
                label={strength.dimension.shortLabel}
              />
              <span>{strength.dimension.shortLabel}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {caveat ? (
        <p className="distro-card-caveat">
          <span className="distro-card-caveat-mark" aria-hidden="true">
            !
          </span>
          {caveat.headline}
        </p>
      ) : null}

      <div className="distro-card-foot">
        <Link className="text-link" to={profilePath} state={profileLinkState}>
          View profile
        </Link>
        <CompareToggle
          distro={distro}
          checked={compareSelected}
          disabled={compareDisabled}
          onChange={onToggleCompare}
        />
      </div>
    </article>
  );
}
