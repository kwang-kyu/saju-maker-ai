import type {
  VNextEvidence,
  VNextEvidenceItem,
} from "../types/humanState.js";

/**
 * ChangeSignal 근거 출처.
 * 사주 원문이 아닌 구조화된 레이어 출처만 기록한다.
 */
export type ChangeSignalEvidenceOrigin =
  | "human"
  | "time"
  | "assessment"
  | "combined";

export type ChangeSignalEvidenceMeta = {
  origin: ChangeSignalEvidenceOrigin;
  ruleId: string;
  referenceKey: string;
};

export function buildChangeSignalEvidence(
  meta: ChangeSignalEvidenceMeta,
  descriptions: readonly string[],
): VNextEvidence {
  const items: VNextEvidenceItem[] = descriptions.map(
    (description, index) => ({
      key: `${meta.ruleId}-${index + 1}`,
      description,
      sourceKey: `${meta.origin}:${meta.referenceKey}`,
    }),
  );

  return {
    items,
    summary: `${meta.origin}:${meta.referenceKey}`,
  };
}

export function mergeChangeSignalEvidence(
  evidenceList: readonly VNextEvidence[],
  origin: ChangeSignalEvidenceOrigin,
): VNextEvidence {
  const items: VNextEvidenceItem[] = [];

  for (const evidence of evidenceList) {
    for (const item of evidence.items) {
      items.push({
        ...item,
        key: `${origin}-${items.length + 1}`,
        sourceKey: item.sourceKey.includes(":")
          ? item.sourceKey
          : `${origin}:${item.sourceKey}`,
      });
    }
  }

  const origins = new Set(
    evidenceList
      .map((evidence) => evidence.summary?.split(":")[0])
      .filter(Boolean),
  );

  const resolvedOrigin =
    origins.size > 1 ? "combined" : origin;

  return {
    items,
    summary: resolvedOrigin,
  };
}

export function evidenceOriginFromSourceKey(
  sourceKey: string,
): ChangeSignalEvidenceOrigin {
  const prefix = sourceKey.split(":")[0];

  if (
    prefix === "human"
    || prefix === "time"
    || prefix === "assessment"
    || prefix === "combined"
  ) {
    return prefix;
  }

  return "combined";
}

export function countDistinctEvidenceOrigins(
  evidence: VNextEvidence,
): number {
  const origins = new Set<ChangeSignalEvidenceOrigin>();

  for (const item of evidence.items) {
    origins.add(evidenceOriginFromSourceKey(item.sourceKey));
  }

  if (origins.size === 0 && evidence.summary) {
    origins.add(evidenceOriginFromSourceKey(evidence.summary));
  }

  return origins.size;
}
