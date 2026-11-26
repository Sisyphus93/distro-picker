/** Upward lineage / packaging ecosystem a distro belongs to. */
export type DistroFamilyId =
  | "debian"
  | "arch"
  | "fedora"
  | "opensuse"
  | "independent";

export interface FamilyMeta {
  id: DistroFamilyId;
  label: string;
  description: string;
}

export const FAMILIES: readonly FamilyMeta[] = [
  {
    id: "debian",
    label: "Debian / Ubuntu",
    description:
      "apt-based distributions tracing back to Debian, including Ubuntu and the many distros built on it.",
  },
  {
    id: "arch",
    label: "Arch",
    description:
      "pacman-based rolling distributions that follow Arch Linux's packaging and AUR ecosystem.",
  },
  {
    id: "fedora",
    label: "Fedora / Red Hat",
    description:
      "RPM-based distributions in the Fedora and Red Hat lineage, including Fedora Atomic images.",
  },
  {
    id: "opensuse",
    label: "openSUSE",
    description:
      "RPM-based distributions from the openSUSE project, built around zypper and YaST.",
  },
  {
    id: "independent",
    label: "Independent",
    description:
      "Distributions with their own packaging and release process rather than an upstream base.",
  },
];

const FAMILY_BY_ID = new Map<DistroFamilyId, FamilyMeta>(
  FAMILIES.map((family) => [family.id, family]),
);

export function getFamily(id: DistroFamilyId): FamilyMeta {
  const family = FAMILY_BY_ID.get(id);
  if (!family) {
    throw new Error(`Unknown distro family: ${id}`);
  }
  return family;
}
