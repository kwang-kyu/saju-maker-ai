/**
 * Frozen Set v1 — Seed Slot Authoring verification (verification-only).
 *
 * Locks:
 * - SEED_SLOTS is a reference alias of SLOT_PLAN (no rematerialize)
 * - SLOT_PLAN length / family softMax ceiling = 222 (authoring ceiling)
 * - SeedSlotSpec contract fields only (no question / Gold / Reader / Freeze)
 * - Deterministic rematerialization of materializeNovelHoldoutFrozenSetV1SlotPlan
 *
 * Does NOT enforce softMin / total 160–200 / auxiliaryFamilyBudget as hard quota.
 * Does NOT import Blind Holdout V1 or P11-4 authored candidates.
 */

import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
  type NovelHoldoutSeedSlotSpec,
} from "./novelHoldoutAllocationSchema.js";
import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import { NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS } from "./novelHoldoutFrozenSetV1SeedSlots.js";
import {
  materializeNovelHoldoutFrozenSetV1SlotPlan,
  NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN,
} from "./novelHoldoutFrozenSetV1SlotPlan.js";

export type NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase = {
  id: string;
  passed: boolean;
  details: readonly string[];
};

export type NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationResult = {
  step: "frozen-set-v1-seed-slot-authoring";
  passed: boolean;
  seedSlotCount: number;
  slotPlanCount: number;
  softMaxSum: number;
  cases: readonly NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase[];
  checks: Readonly<Record<string, boolean>>;
};

const ALLOWED_FAMILIES = new Set<NovelHoldoutFamily>([
  "business-start",
  "business-continue",
  "business-stop",
  "business-buy",
  "job-changeJob",
  "job-leaveJob",
  "realEstate-buy",
  "realEstate-continue",
  "realEstate-sell",
  "money-invest",
  "money-manageMoney",
  "lifeDirection",
  "relationship",
  "general",
  "other",
]);

const ALLOWED_TAXONOMIES = new Set<NovelHoldoutTaxonomy>([
  "A_SAME_MEANING_PARAPHRASE",
  "B_TARGET_VARIATION",
  "C_QUESTION_FORM_VARIATION",
  "D_BOUNDARY_COLLISION",
  "E_UNKNOWN_VOCABULARY",
  "F_COMPOSITE",
  "G_AMBIGUOUS_DESIGN_LIMIT",
]);

const ALLOWED_NOVELTY_TIERS = new Set<NovelHoldoutNoveltyTier>([
  "lexical",
  "syntactic",
  "combinational",
]);

const FORBIDDEN_AUTHORING_STAGE_KEYS = [
  "question",
  "gold",
  "stage",
  "readerActual",
  "frozenRevision",
  "contentHash",
  "freezeRecord",
  "freeze",
  "goldRationale",
  "expectedTopic",
  "expectedIntent",
  "expectedDecisionTarget",
  "actual",
] as const;

function softMaxSumOfAllocation(): number {
  return NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.families.reduce(
    (sum, family) => sum + family.softMax,
    0,
  );
}

function countSlotsByFamily(
  slots: readonly NovelHoldoutSeedSlotSpec[],
): Map<NovelHoldoutFamily, number> {
  const counts = new Map<NovelHoldoutFamily, number>();
  for (const slot of slots) {
    counts.set(slot.family, (counts.get(slot.family) ?? 0) + 1);
  }
  return counts;
}

function verifyReferenceIdentity():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const sameReference =
    NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS
    === NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN;

  return {
    id: "seed-slots-reference-identity-with-slot-plan",
    passed: sameReference,
    details: [
      `SEED_SLOTS===SLOT_PLAN=${sameReference}`,
      `seedSlotCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length}`,
      `slotPlanCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN.length}`,
    ],
  };
}

function verifyCounts(): NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const seedCount = NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length;
  const planCount = NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN.length;

  return {
    id: "seed-slot-and-slot-plan-count-222",
    passed: seedCount === 222 && planCount === 222,
    details: [
      `SEED_SLOTS.length=${seedCount}`,
      `SLOT_PLAN.length=${planCount}`,
      "expected=222",
    ],
  };
}

function verifyAllocationCeiling():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const softMaxSum = softMaxSumOfAllocation();

  return {
    id: "allocation-softMax-sum-equals-222",
    passed: softMaxSum === 222,
    details: [
      `sum(families[].softMax)=${softMaxSum}`,
      "expected=222",
      `familyCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.families.length}`,
    ],
  };
}

function verifyFamilyCountsMatchSoftMax():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const counts = countSlotsByFamily(NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS);
  const mismatches: string[] = [];

  for (const family of NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.families) {
    const actual = counts.get(family.family) ?? 0;
    if (actual !== family.softMax) {
      mismatches.push(
        `${family.family}: count=${actual} softMax=${family.softMax}`,
      );
    }
  }

  return {
    id: "family-slot-count-equals-softMax",
    passed:
      mismatches.length === 0
      && NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.families.length === 14,
    details: [
      `allocationFamilyCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.families.length}`,
      `mismatchCount=${mismatches.length}`,
      ...mismatches.slice(0, 14),
    ],
  };
}

function verifyDeterministicMaterialization():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const first = materializeNovelHoldoutFrozenSetV1SlotPlan();
  const second = materializeNovelHoldoutFrozenSetV1SlotPlan();

  const firstJson = JSON.stringify(first);
  const secondJson = JSON.stringify(second);
  const planJson = JSON.stringify(NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN);

  const firstEqualsSecond = firstJson === secondJson;
  const firstEqualsPlan = firstJson === planJson;
  const secondEqualsPlan = secondJson === planJson;

  return {
    id: "materialize-slot-plan-deterministic",
    passed: firstEqualsSecond && firstEqualsPlan && secondEqualsPlan,
    details: [
      `firstEqualsSecond=${firstEqualsSecond}`,
      `firstEqualsSLOT_PLAN=${firstEqualsPlan}`,
      `secondEqualsSLOT_PLAN=${secondEqualsPlan}`,
      `rematerializedCount=${first.length}`,
    ],
  };
}

function verifySlotIds(): NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const seen = new Set<string>();
  const emptyIds: string[] = [];
  const duplicates: string[] = [];

  for (const [index, slot] of NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.entries()) {
    if (typeof slot.slotId !== "string" || slot.slotId.trim().length === 0) {
      emptyIds.push(`index=${index}`);
      continue;
    }
    if (seen.has(slot.slotId)) {
      duplicates.push(slot.slotId);
    } else {
      seen.add(slot.slotId);
    }
  }

  return {
    id: "slotId-non-empty-and-unique",
    passed: emptyIds.length === 0 && duplicates.length === 0,
    details: [
      `uniqueCount=${seen.size}`,
      `emptyCount=${emptyIds.length}`,
      `duplicateCount=${duplicates.length}`,
      ...emptyIds.slice(0, 4),
      ...duplicates.slice(0, 8),
    ],
  };
}

function verifySeedSlotSpecContract():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const violations: string[] = [];

  for (const slot of NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS) {
    if (typeof slot.slotId !== "string" || slot.slotId.trim().length === 0) {
      violations.push(`${slot.slotId ?? "?"}: invalid slotId`);
    }
    if (!ALLOWED_FAMILIES.has(slot.family)) {
      violations.push(`${slot.slotId}: invalid family=${String(slot.family)}`);
    }
    if (!ALLOWED_TAXONOMIES.has(slot.taxonomyPrimary)) {
      violations.push(
        `${slot.slotId}: invalid taxonomyPrimary=${String(slot.taxonomyPrimary)}`,
      );
    }
    if (!Array.isArray(slot.noveltyTier)) {
      violations.push(`${slot.slotId}: noveltyTier is not an array`);
    }
    if (
      typeof slot.decisionAxisHint !== "string"
      || slot.decisionAxisHint.trim().length === 0
    ) {
      violations.push(`${slot.slotId}: invalid decisionAxisHint`);
    }
    if (
      typeof slot.authoringBrief !== "string"
      || slot.authoringBrief.trim().length === 0
    ) {
      violations.push(`${slot.slotId}: invalid authoringBrief`);
    }
  }

  return {
    id: "seed-slot-spec-required-contract",
    passed: violations.length === 0,
    details: [
      `slotCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length}`,
      `violationCount=${violations.length}`,
      ...violations.slice(0, 12),
    ],
  };
}

function verifyNoveltyTierContract():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const violations: string[] = [];

  for (const slot of NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS) {
    if (!Array.isArray(slot.noveltyTier)) {
      violations.push(`${slot.slotId}: noveltyTier not array`);
      continue;
    }
    if (slot.noveltyTier.length === 0) {
      violations.push(`${slot.slotId}: noveltyTier empty`);
      continue;
    }
    for (const tier of slot.noveltyTier) {
      if (!ALLOWED_NOVELTY_TIERS.has(tier)) {
        violations.push(
          `${slot.slotId}: invalid noveltyTier=${String(tier)}`,
        );
      }
    }
  }

  return {
    id: "noveltyTier-array-nonempty-allowed",
    passed: violations.length === 0,
    details: [
      `slotCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length}`,
      `violationCount=${violations.length}`,
      ...violations.slice(0, 12),
    ],
  };
}

function verifyForbiddenAuthoringStageFields():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const violations: string[] = [];

  for (const slot of NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS) {
    const record = slot as Record<string, unknown>;
    for (const key of FORBIDDEN_AUTHORING_STAGE_KEYS) {
      if (key in record) {
        violations.push(`${slot.slotId}: forbidden key ${key}`);
      }
    }
  }

  return {
    id: "forbidden-authoring-stage-fields-absent",
    passed: violations.length === 0,
    details: [
      `checkedKeys=${FORBIDDEN_AUTHORING_STAGE_KEYS.join(",")}`,
      `violationCount=${violations.length}`,
      ...violations.slice(0, 12),
    ],
  };
}

function verifySoftMaxCeilingSemantics():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationCase {
  const softMaxSum = softMaxSumOfAllocation();
  const totalMax = NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.total.max;
  const counts = countSlotsByFamily(NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS);
  const familyMatches = NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.families.every(
    (family) => (counts.get(family.family) ?? 0) === family.softMax,
  );

  const ceilingAboveTotalMax = softMaxSum === 222 && softMaxSum > totalMax;

  return {
    id: "softMax-ceiling-authoring-not-completion",
    passed: familyMatches && softMaxSum === 222 && ceilingAboveTotalMax,
    details: [
      `familyCountEqualsSoftMax=${familyMatches}`,
      `sumSoftMax=${softMaxSum}`,
      `allocation.total.max=${totalMax}`,
      `sumSoftMaxGreaterThanTotalMax=${softMaxSum > totalMax}`,
      "meaning=222 is authoring ceiling, not completion count",
    ],
  };
}

export function verifyNovelHoldoutFrozenSetV1SeedSlotAuthoring():
  NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationResult {
  const cases = [
    verifyReferenceIdentity(),
    verifyCounts(),
    verifyAllocationCeiling(),
    verifyFamilyCountsMatchSoftMax(),
    verifyDeterministicMaterialization(),
    verifySlotIds(),
    verifySeedSlotSpecContract(),
    verifyNoveltyTierContract(),
    verifyForbiddenAuthoringStageFields(),
    verifySoftMaxCeilingSemantics(),
  ];

  const checks: Record<string, boolean> = {};
  for (const verificationCase of cases) {
    checks[verificationCase.id] = verificationCase.passed;
  }

  return {
    step: "frozen-set-v1-seed-slot-authoring",
    passed: cases.every((verificationCase) => verificationCase.passed),
    seedSlotCount: NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length,
    slotPlanCount: NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN.length,
    softMaxSum: softMaxSumOfAllocation(),
    cases,
    checks,
  };
}

export function serializeNovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationResult(
  result: NovelHoldoutFrozenSetV1SeedSlotAuthoringVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      seedSlotCount: result.seedSlotCount,
      slotPlanCount: result.slotPlanCount,
      softMaxSum: result.softMaxSum,
      checks: result.checks,
      cases: result.cases,
    },
    null,
    2,
  );
}
