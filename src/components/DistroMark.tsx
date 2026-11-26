import type { DistroProfile } from "../domain";

/** WCAG-ish relative luminance so monograms stay readable on any accent. */
export function contrastOn(hex: string): string {
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
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.4 ? "#17301f" : "#ffffff";
}

/**
 * The visual distro identifier used everywhere a profile is shown: a monogram
 * tile tinted with the distro's accent colour (no bitmaps in v1).
 */
export default function DistroMark({
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
