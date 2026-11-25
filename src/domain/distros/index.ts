import type { DistroProfile } from "../types";
import { archLinux } from "./arch-linux";
import { bazzite } from "./bazzite";
import { debian } from "./debian";
import { elementaryOs } from "./elementary-os";
import { endeavouros } from "./endeavouros";
import { fedoraWorkstation } from "./fedora-workstation";
import { linuxLite } from "./linux-lite";
import { linuxMint } from "./linux-mint";
import { manjaro } from "./manjaro";
import { mxLinux } from "./mx-linux";
import { nixos } from "./nixos";
import { nobara } from "./nobara";
import { opensuseTumbleweed } from "./opensuse-tumbleweed";
import { popOs } from "./pop-os";
import { ubuntu } from "./ubuntu";
import { zorinOs } from "./zorin-os";

/**
 * The curated v1 dataset, in presentation-neutral catalog order.
 *
 * Adding a distro: create a profile file, import it here, add its slug to
 * `EXPECTED_DISTRO_SLUGS` in `integrity.ts`, and run the app in development
 * mode — `assertDomainIntegrity` validates the dataset on load.
 */
export const DISTROS: readonly DistroProfile[] = [
  ubuntu,
  linuxMint,
  zorinOs,
  popOs,
  fedoraWorkstation,
  debian,
  opensuseTumbleweed,
  archLinux,
  endeavouros,
  manjaro,
  mxLinux,
  elementaryOs,
  nobara,
  bazzite,
  nixos,
  linuxLite,
];

export const DISTRO_SLUGS: readonly string[] = DISTROS.map(
  (distro) => distro.slug,
);

const DISTRO_BY_SLUG = new Map<string, DistroProfile>(
  DISTROS.map((distro) => [distro.slug, distro]),
);

export function getDistroBySlug(slug: string): DistroProfile | undefined {
  return DISTRO_BY_SLUG.get(slug);
}

export function requireDistroBySlug(slug: string): DistroProfile {
  const distro = getDistroBySlug(slug);
  if (!distro) {
    throw new Error(`Unknown distro slug: ${slug}`);
  }
  return distro;
}

/**
 * Resolves slugs in the given order, skipping unknown ones. Used by the
 * comparison view, where a stale selection should not break the page.
 */
export function getDistrosBySlugs(slugs: readonly string[]): DistroProfile[] {
  return slugs
    .map((slug) => getDistroBySlug(slug))
    .filter((distro): distro is DistroProfile => distro !== undefined);
}
