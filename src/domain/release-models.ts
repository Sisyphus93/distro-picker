/** How a distribution delivers updates and new versions. */
export type ReleaseModelId =
  | "lts"
  | "point-release"
  | "rolling"
  | "curated-rolling"
  | "image-based";

export interface ReleaseModelMeta {
  id: ReleaseModelId;
  label: string;
  description: string;
}

export const RELEASE_MODELS: readonly ReleaseModelMeta[] = [
  {
    id: "lts",
    label: "Long-term support",
    description:
      "Few, well-tested releases with years of security updates. Software is older but predictable.",
  },
  {
    id: "point-release",
    label: "Scheduled point releases",
    description:
      "New versions on a fixed schedule with a supported overlap, so upgrades are planned rather than constant.",
  },
  {
    id: "rolling",
    label: "Rolling release",
    description:
      "Continuous updates to the latest software with no big version upgrades. Fresh, but you keep up with changes.",
  },
  {
    id: "curated-rolling",
    label: "Curated rolling",
    description:
      "A rolling base where updates are held back briefly for extra testing before they reach you.",
  },
  {
    id: "image-based",
    label: "Image-based (atomic)",
    description:
      "The whole system updates as one tested image, with updates staged and easy to roll back.",
  },
];

const RELEASE_MODEL_BY_ID = new Map<ReleaseModelId, ReleaseModelMeta>(
  RELEASE_MODELS.map((model) => [model.id, model]),
);

export function getReleaseModel(id: ReleaseModelId): ReleaseModelMeta {
  const model = RELEASE_MODEL_BY_ID.get(id);
  if (!model) {
    throw new Error(`Unknown release model: ${id}`);
  }
  return model;
}
