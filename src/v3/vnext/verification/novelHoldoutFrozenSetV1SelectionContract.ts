/**
 * Frozen Set v1 — Selection Contract (verification-only).
 *
 * Stage: Selection Contract + initial pass-through algorithm.
 *
 * Scope:
 * - Consume already-evaluated Gate rows (PASS/REVIEW eligible)
 * - Deterministic selectedSlotIds (slotId ascending)
 * - Soft-gap reporting against allocation soft targets
 *
 * Forbidden:
 * - Re-running Novelty / Leakage gates
 * - Using Gold expectedTopic / Intent / DecisionTarget as ranking oracle
 * - Reader / DecisionEngine / Freeze
 * - Hard-failing on total.min / family softMin / share shortfalls
 * - Blind Holdout v1 fixed-50 selection copy
 * - Arbitrary scoring / random selection
 */

import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
  type NovelHoldoutFrozenSetV1AllocationSchema,
} from "./novelHoldoutAllocationSchema.js";
import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import { fingerprintNovelHoldoutContent } from "./novelHoldoutFreezeContract.js";
import type { NovelHoldoutFrozenSetV1GoldRow } from "./novelHoldoutFrozenSetV1Gold.js";
import type {
  FrozenSetV1GateBucket,
  FrozenSetV1GateRowResult,
  FrozenSetV1GateVerificationResult,
} from "./novelHoldoutFrozenSetV1GateVerification.js";
import type { NovelHoldoutFrozenSetV1AuthoredQuestion } from "./novelHoldoutFrozenSetV1Questions.js";

/**
 * FSV1-only selection revision. Distinct from Freeze contentHash / freezeRevision.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION =
  "frozen-set-v1-selection-pass-through-r1" as const;

export type NovelHoldoutFrozenSetV1SelectionRevision =
  typeof NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION;

/**
 * Future capacity policy placeholder (type-level only).
 * Not applied while eligibleCount <= allocation.total.max.
 */
export type FrozenSetV1FutureCapacityTrimPolicy = {
  mode: "future_capacity_trim_unimplemented";
  totalMax: number;
  note: string;
};

export const FSV1_FUTURE_CAPACITY_TRIM_POLICY:
  FrozenSetV1FutureCapacityTrimPolicy = {
    mode: "future_capacity_trim_unimplemented",
    totalMax: NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.total.max,
    note:
      "When eligibleCount exceeds total.max, a later step may add deterministic "
      + "capacity trim. This revision does not score, rank, or randomly drop rows.",
  };

export type FrozenSetV1SelectionJoinMaterials = {
  /**
   * Optional Question/Gold join materials for bookkeeping only.
   * Must never feed expectedTopic/Intent/DecisionTarget into eligibility
   * or ranking.
   */
  questions?: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[];
  goldRows?: readonly NovelHoldoutFrozenSetV1GoldRow[];
};

export type FrozenSetV1SelectionGateSnapshot = {
  gateReady: boolean;
  rows: readonly FrozenSetV1GateRowResult[];
  total: number;
  acceptedCount: number;
  reviewCount: number;
  rejectedCount: number;
};

export type FrozenSetV1SelectionInput = {
  gate: FrozenSetV1SelectionGateSnapshot;
  allocation?: NovelHoldoutFrozenSetV1AllocationSchema;
  join?: FrozenSetV1SelectionJoinMaterials;
};

export type FrozenSetV1FamilySoftGap = {
  family: NovelHoldoutFamily;
  softMin: number;
  softMax: number;
  selected: number;
  softMinGap: number;
  softMaxHeadroom: number;
};

export type FrozenSetV1SoftGuidanceShortfall = {
  kind:
    | "total_min"
    | "family_soft_min"
    | "taxonomy_share"
    | "novelty_share";
  key: string;
  detail: string;
};

export type FrozenSetV1SoftGapReport = {
  selectedCount: number;
  targetMin: number;
  targetMax: number;
  totalMinGap: number;
  totalMaxHeadroom: number;
  familyDistribution: Readonly<Record<string, number>>;
  familySoftGaps: readonly FrozenSetV1FamilySoftGap[];
  taxonomyDistribution: Readonly<Record<string, number>>;
  noveltyTierDistribution: Readonly<Record<string, number>>;
  softGuidanceShortfalls: readonly FrozenSetV1SoftGuidanceShortfall[];
};

export type FrozenSetV1SelectionExclusionReason =
  | "capacity_total_max_future"
  | "selection_policy_future";

export type FrozenSetV1SelectionResult = {
  selectedSlotIds: readonly string[];
  selectedCount: number;
  /**
   * Selection-algorithm exclusions only.
   * Gate REJECT rows are NOT listed here — they never enter selection input.
   */
  excludedSlotIds: readonly string[];
  exclusionReasons: Readonly<
    Record<string, FrozenSetV1SelectionExclusionReason | string>
  >;
  /**
   * Gate REJECT slotIds observed on the gate snapshot (not selection exclusions).
   */
  gateRejectedSlotIds: readonly string[];
  softGapReport: FrozenSetV1SoftGapReport;
  selectionRevision: NovelHoldoutFrozenSetV1SelectionRevision;
  selectionFingerprint: string;
  gateReady: boolean;
  readerExecuted: false;
  gatesReRun: false;
  eligibleCount: number;
  eligibleSlotIds: readonly string[];
};

function compareSlotId(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isSelectionEligibleBucket(bucket: FrozenSetV1GateBucket): boolean {
  return bucket === "PASS" || bucket === "REVIEW";
}

function bumpCount(bag: Record<string, number>, key: string): void {
  bag[key] = (bag[key] ?? 0) + 1;
}

function sortedUnique(ids: readonly string[]): string[] {
  return [...new Set(ids)].sort(compareSlotId);
}

/**
 * Build soft-gap report from selected gate rows + allocation soft targets.
 * Shortfalls are guidance only — never selection FAIL.
 */
export function buildFrozenSetV1SoftGapReport(
  selectedRows: readonly FrozenSetV1GateRowResult[],
  allocation: NovelHoldoutFrozenSetV1AllocationSchema =
    NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
): FrozenSetV1SoftGapReport {
  const selectedCount = selectedRows.length;
  const targetMin = allocation.total.min;
  const targetMax = allocation.total.max;
  const totalMinGap = Math.max(0, targetMin - selectedCount);
  const totalMaxHeadroom = Math.max(0, targetMax - selectedCount);

  const familyDistribution: Record<string, number> = {};
  const taxonomyDistribution: Record<string, number> = {};
  const noveltyTierDistribution: Record<string, number> = {};

  for (const row of selectedRows) {
    bumpCount(familyDistribution, row.family);
    bumpCount(taxonomyDistribution, row.taxonomyPrimary);
    for (const tier of row.declaredNoveltyTier) {
      bumpCount(noveltyTierDistribution, tier);
    }
  }

  const familySoftGaps: FrozenSetV1FamilySoftGap[] = allocation.families.map(
    (family) => {
      const selected = familyDistribution[family.family] ?? 0;
      return {
        family: family.family,
        softMin: family.softMin,
        softMax: family.softMax,
        selected,
        softMinGap: Math.max(0, family.softMin - selected),
        softMaxHeadroom: Math.max(0, family.softMax - selected),
      };
    },
  );

  const softGuidanceShortfalls: FrozenSetV1SoftGuidanceShortfall[] = [];

  if (totalMinGap > 0) {
    softGuidanceShortfalls.push({
      kind: "total_min",
      key: "total",
      detail:
        `selectedCount=${selectedCount} < targetMin=${targetMin} `
        + `(gap=${totalMinGap})`,
    });
  }

  for (const gap of familySoftGaps) {
    if (gap.softMinGap > 0) {
      softGuidanceShortfalls.push({
        kind: "family_soft_min",
        key: gap.family,
        detail:
          `family=${gap.family} selected=${gap.selected} `
          + `< softMin=${gap.softMin} (gap=${gap.softMinGap})`,
      });
    }
  }

  for (const share of allocation.taxonomyShares) {
    const count = taxonomyDistribution[share.taxonomy] ?? 0;
    const observedShare =
      selectedCount === 0 ? 0 : count / selectedCount;
    if (observedShare + 1e-12 < share.share) {
      softGuidanceShortfalls.push({
        kind: "taxonomy_share",
        key: share.taxonomy,
        detail:
          `taxonomy=${share.taxonomy} share=${observedShare.toFixed(4)} `
          + `< target=${share.share} (count=${count}/${selectedCount})`,
      });
    }
  }

  for (const share of allocation.noveltyShares) {
    const count = noveltyTierDistribution[share.tier] ?? 0;
    const observedShare =
      selectedCount === 0 ? 0 : count / selectedCount;
    if (observedShare + 1e-12 < share.share) {
      softGuidanceShortfalls.push({
        kind: "novelty_share",
        key: share.tier,
        detail:
          `noveltyTier=${share.tier} share=${observedShare.toFixed(4)} `
          + `< target=${share.share} (count=${count}/${selectedCount})`,
      });
    }
  }

  return {
    selectedCount,
    targetMin,
    targetMax,
    totalMinGap,
    totalMaxHeadroom,
    familyDistribution,
    familySoftGaps,
    taxonomyDistribution,
    noveltyTierDistribution,
    softGuidanceShortfalls,
  };
}

/**
 * Deterministic selection fingerprint.
 * Distinct from Freeze contentHash — binds gated inputs + selected ids + revision.
 */
export function computeFrozenSetV1SelectionFingerprint(input: {
  selectionRevision: string;
  gateReady: boolean;
  eligibleSlotIds: readonly string[];
  selectedSlotIds: readonly string[];
  excludedSlotIds: readonly string[];
}): string {
  const payload = [
    "fsv1-selection-fingerprint",
    input.selectionRevision,
    `gateReady=${input.gateReady ? "1" : "0"}`,
    `eligible=${sortedUnique(input.eligibleSlotIds).join(",")}`,
    `selected=${sortedUnique(input.selectedSlotIds).join(",")}`,
    `excluded=${sortedUnique(input.excludedSlotIds).join(",")}`,
  ].join("\u001f");

  return fingerprintNovelHoldoutContent(payload);
}

export function snapshotGateForSelection(
  gate: FrozenSetV1GateVerificationResult,
): FrozenSetV1SelectionGateSnapshot {
  return {
    gateReady: gate.gateReady,
    rows: gate.rows,
    total: gate.total,
    acceptedCount: gate.acceptedCount,
    reviewCount: gate.reviewCount,
    rejectedCount: gate.rejectedCount,
  };
}

/**
 * Initial FSV1 selection:
 * - Reject gate REJECT from eligibility (not a selection exclusion)
 * - PASS + REVIEW pass through when under/at total.max
 * - No Gold-axis scoring; no gate re-run; no Reader
 */
export function selectNovelHoldoutFrozenSetV1(
  input: FrozenSetV1SelectionInput,
): FrozenSetV1SelectionResult {
  const allocation =
    input.allocation ?? NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION;
  const gateReady = input.gate.gateReady;

  // Join materials are accepted for bookkeeping only and intentionally unused
  // for eligibility / ranking (Gold expected axes must not drive selection).
  void input.join;

  const gateRejectedSlotIds = sortedUnique(
    input.gate.rows
      .filter((row) => row.overallBucket === "REJECT")
      .map((row) => row.slotId),
  );

  const eligibleRows = gateReady
    ? [...input.gate.rows]
      .filter((row) => isSelectionEligibleBucket(row.overallBucket))
      .sort((left, right) => compareSlotId(left.slotId, right.slotId))
    : [];

  const eligibleSlotIds = eligibleRows.map((row) => row.slotId);

  // Initial algorithm: deterministic pass-through of all eligible rows.
  // Over-max capacity trim is type-prepared only (see FSV1_FUTURE_CAPACITY_TRIM_POLICY).
  // Do not score/rank/random-drop; do not hard-enforce 160–200 here.
  void FSV1_FUTURE_CAPACITY_TRIM_POLICY;
  const selectedRows = eligibleRows;
  const excludedSlotIds: string[] = [];
  const exclusionReasons: Record<string, string> = {};

  const selectedSlotIds = selectedRows.map((row) => row.slotId);
  const softGapReport = buildFrozenSetV1SoftGapReport(
    selectedRows,
    allocation,
  );

  const selectionRevision = NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION;
  const selectionFingerprint = computeFrozenSetV1SelectionFingerprint({
    selectionRevision,
    gateReady,
    eligibleSlotIds,
    selectedSlotIds,
    excludedSlotIds,
  });

  return {
    selectedSlotIds,
    selectedCount: selectedSlotIds.length,
    excludedSlotIds,
    exclusionReasons,
    gateRejectedSlotIds,
    softGapReport,
    selectionRevision,
    selectionFingerprint,
    gateReady,
    readerExecuted: false,
    gatesReRun: false,
    eligibleCount: eligibleSlotIds.length,
    eligibleSlotIds,
  };
}

/** Re-export taxonomy/family aliases for verification consumers. */
export type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
};
