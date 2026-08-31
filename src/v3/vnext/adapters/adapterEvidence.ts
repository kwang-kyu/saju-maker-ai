import type {
  VNextEvidence,
  VNextEvidenceItem,
} from "../types/humanState.js";

export function toVNextEvidenceFromStrings(
  evidence: readonly string[],
  sourceKey: string,
): VNextEvidence {
  const items: VNextEvidenceItem[] = evidence.map(
    (description, index) => ({
      key: `${sourceKey}-${index + 1}`,
      description,
      sourceKey,
    }),
  );

  return {
    items,
  };
}

export function emptyVNextEvidence(): VNextEvidence {
  return {
    items: [],
  };
}
