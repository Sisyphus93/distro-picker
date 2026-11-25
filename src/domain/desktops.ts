/** Desktop environments that appear as a distro's default desktop in v1. */
export type DesktopId =
  | "gnome"
  | "kde-plasma"
  | "cinnamon"
  | "mate"
  | "xfce"
  | "pantheon"
  | "cosmic"
  | "fluxbox";

export interface DesktopMeta {
  id: DesktopId;
  label: string;
  description: string;
}

export const DESKTOPS: readonly DesktopMeta[] = [
  {
    id: "gnome",
    label: "GNOME",
    description:
      "Modern, touch-friendly and opinionated, with a workspace-based workflow and little on-screen clutter.",
  },
  {
    id: "kde-plasma",
    label: "KDE Plasma",
    description:
      "A traditional, Windows-like desktop that is also the most deeply configurable of the mainstream environments.",
  },
  {
    id: "cinnamon",
    label: "Cinnamon",
    description:
      "A familiar Windows-style layout built for comfort, with sensible defaults and easy theming.",
  },
  {
    id: "mate",
    label: "MATE",
    description:
      "A traditional, resource-friendly continuation of GNOME 2 with a classic menu-and-panel layout.",
  },
  {
    id: "xfce",
    label: "Xfce",
    description:
      "Lean, predictable and quick, especially on older or lower-spec machines.",
  },
  {
    id: "pantheon",
    label: "Pantheon",
    description:
      "elementary's refined, macOS-flavoured desktop, designed around its own curated app suite.",
  },
  {
    id: "cosmic",
    label: "COSMIC",
    description:
      "System76's new Rust-built desktop with optional tiling and a keyboard-forward workflow.",
  },
  {
    id: "fluxbox",
    label: "Fluxbox",
    description:
      "A bare-bones window manager for very low-resource setups and people who like to build their own.",
  },
];

const DESKTOP_BY_ID = new Map<DesktopId, DesktopMeta>(
  DESKTOPS.map((desktop) => [desktop.id, desktop]),
);

export function getDesktop(id: DesktopId): DesktopMeta {
  const desktop = DESKTOP_BY_ID.get(id);
  if (!desktop) {
    throw new Error(`Unknown desktop environment: ${id}`);
  }
  return desktop;
}
