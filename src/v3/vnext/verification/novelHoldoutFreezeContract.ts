/**
 * P11-3 Freeze contract (verification-only).
 *
 * Frozen Set v1 identifies:
 * - frozenRevision
 * - contentHash
 * - row count
 * - accepted / rejected counts
 * - taxonomy / noveltyTier / family distributions
 *
 * Draft / smoke samples are never frozen.
 * Score-chasing edits after freeze require revision bump.
 */

import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutRow,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";

export type NovelHoldoutFreezeRowKind =
  | "accepted"
  | "rejected"
  | "draft_excluded";

export type NovelHoldoutFreezeCandidateRecord = {
  row: NovelHoldoutRow;
  kind: NovelHoldoutFreezeRowKind;
  rejectReasons?: readonly string[];
};

export type NovelHoldoutDistributionCount = Readonly<Record<string, number>>;

export type NovelHoldoutFrozenSetManifest = {
  frozenRevision: string;
  contentHash: string;
  rowCount: number;
  acceptedCount: number;
  rejectedCount: number;
  draftExcludedCount: number;
  taxonomyDistribution: NovelHoldoutDistributionCount;
  noveltyTierDistribution: NovelHoldoutDistributionCount;
  familyDistribution: NovelHoldoutDistributionCount;
  /**
   * Sorted accepted row ids included in contentHash.
   */
  acceptedRowIds: readonly string[];
};

/**
 * Fields that participate in contentHash.
 * Changing question/Gold content must change the hash.
 */
function hashPayloadForRow(row: NovelHoldoutRow): string {
  return [
    row.id,
    row.family,
    row.taxonomyPrimary,
    (row.taxonomySecondary ?? []).join(","),
    row.noveltyTier.join(","),
    row.question,
    row.expectedTopic,
    row.expectedIntent,
    row.expectedDecisionTarget,
    row.expectedTimingType ?? "",
    row.expectedAnalysisMode ?? "",
    row.matchPolicy,
    row.goldConfidence,
    row.goldRationale,
    row.ambiguityLabel ?? "",
    row.compositeNote ?? "",
    row.boundaryAgainst ?? "",
    row.frozenRevision,
  ].join("\u001f");
}

/**
 * Deterministic non-crypto fingerprint (verification-only).
 * Good enough to detect content drift; not a security hash.
 */
export function fingerprintNovelHoldoutContent(
  payload: string,
): string {
  let hash = 2166136261;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  // Mix length so empty vs short payloads diverge clearly.
  hash ^= payload.length;
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  hash ^= hash >>> 16;

  const asUnsigned = hash >>> 0;
  return `fnv1a32:${asUnsigned.toString(16).padStart(8, "0")}`;
}

export function computeNovelHoldoutContentHash(
  acceptedRows: readonly NovelHoldoutRow[],
): string {
  const lines = [...acceptedRows]
    .map((row) => hashPayloadForRow(row))
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));

  return fingerprintNovelHoldoutContent(lines.join("\n"));
}

function bumpCount(
  bag: Record<string, number>,
  key: string,
): void {
  bag[key] = (bag[key] ?? 0) + 1;
}

function distributionFromRows(
  rows: readonly NovelHoldoutRow[],
): {
  taxonomy: NovelHoldoutDistributionCount;
  novelty: NovelHoldoutDistributionCount;
  family: NovelHoldoutDistributionCount;
} {
  const taxonomy: Record<string, number> = {};
  const novelty: Record<string, number> = {};
  const family: Record<string, number> = {};

  for (const row of rows) {
    bumpCount(taxonomy, row.taxonomyPrimary as NovelHoldoutTaxonomy);
    bumpCount(family, row.family as NovelHoldoutFamily);
    for (const tier of row.noveltyTier) {
      bumpCount(novelty, tier as NovelHoldoutNoveltyTier);
    }
  }

  return { taxonomy, novelty, family };
}

/**
 * Build freeze manifest. Draft-excluded records never enter accepted set / hash.
 */
export function buildNovelHoldoutFrozenSetManifest(input: {
  frozenRevision: string;
  records: readonly NovelHoldoutFreezeCandidateRecord[];
}): NovelHoldoutFrozenSetManifest {
  const accepted = input.records
    .filter((record) => record.kind === "accepted")
    .map((record) => record.row);

  const rejectedCount = input.records.filter(
    (record) => record.kind === "rejected",
  ).length;
  const draftExcludedCount = input.records.filter(
    (record) => record.kind === "draft_excluded",
  ).length;

  const distributions = distributionFromRows(accepted);
  const acceptedRowIds = [...accepted]
    .map((row) => row.id)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));

  return {
    frozenRevision: input.frozenRevision,
    contentHash: computeNovelHoldoutContentHash(accepted),
    rowCount: accepted.length,
    acceptedCount: accepted.length,
    rejectedCount,
    draftExcludedCount,
    taxonomyDistribution: distributions.taxonomy,
    noveltyTierDistribution: distributions.novelty,
    familyDistribution: distributions.family,
    acceptedRowIds,
  };
}

/**
 * Score-chasing edits after freeze are forbidden without revision bump.
 */
export function assertFreezeRevisionBumpRequired(input: {
  previous: NovelHoldoutFrozenSetManifest;
  nextAcceptedRows: readonly NovelHoldoutRow[];
  nextFrozenRevision: string;
}): {
  contentChanged: boolean;
  revisionBumped: boolean;
  ok: boolean;
  reasons: readonly string[];
} {
  const nextHash = computeNovelHoldoutContentHash(input.nextAcceptedRows);
  const contentChanged = nextHash !== input.previous.contentHash;
  const revisionBumped =
    input.nextFrozenRevision !== input.previous.frozenRevision;

  const reasons: string[] = [];
  if (contentChanged && !revisionBumped) {
    reasons.push(
      "accepted content changed without frozenRevision bump",
    );
  }

  return {
    contentChanged,
    revisionBumped,
    ok: reasons.length === 0,
    reasons,
  };
}

/**
 * Empty Frozen Set v1 placeholder — P11-3 does not seal real holdouts.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_PLACEHOLDER_MANIFEST:
  NovelHoldoutFrozenSetManifest = buildNovelHoldoutFrozenSetManifest({
    frozenRevision: "frozen-set-v1-unsealed-p11-3",
    records: [],
  });
