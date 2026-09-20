/**
 * Frozen Set v1 — Selection Verification (verification-only).
 *
 * Validates Selection Contract pass-through against live Gate snapshot.
 * Does NOT re-author Questions/Gold, re-run gates for selection scoring,
 * or implement Freeze / Reader Observation.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION } from "./novelHoldoutAllocationSchema.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
} from "./novelHoldoutFrozenSetV1Gold.js";
import {
  verifyNovelHoldoutFrozenSetV1Gates,
  type FrozenSetV1GateRowResult,
  type FrozenSetV1GateVerificationResult,
} from "./novelHoldoutFrozenSetV1GateVerification.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
} from "./novelHoldoutFrozenSetV1Questions.js";
import { NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS } from "./novelHoldoutFrozenSetV1SeedSlots.js";
import { NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN } from "./novelHoldoutFrozenSetV1SlotPlan.js";
import {
  computeFrozenSetV1SelectionFingerprint,
  NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION,
  selectNovelHoldoutFrozenSetV1,
  snapshotGateForSelection,
  type FrozenSetV1SelectionResult,
} from "./novelHoldoutFrozenSetV1SelectionContract.js";

export type FrozenSetV1SelectionVerificationCase = {
  id: string;
  passed: boolean;
  details: readonly string[];
};

export type FrozenSetV1SelectionVerificationResult = {
  step: "FSV1-SELECTION";
  passed: boolean;
  gateReady: boolean;
  selectedCount: number;
  selectedSlotIds: readonly string[];
  excludedSlotIds: readonly string[];
  selectionFingerprint: string;
  softGapReport: FrozenSetV1SelectionResult["softGapReport"];
  readerExecuted: false;
  gatesReRun: false;
  cases: readonly FrozenSetV1SelectionVerificationCase[];
  checks: Readonly<Record<string, boolean>>;
  gateSummary: {
    total: number;
    acceptedCount: number;
    reviewCount: number;
    rejectedCount: number;
    novelty: FrozenSetV1GateVerificationResult["novelty"];
    leakage: FrozenSetV1GateVerificationResult["leakage"];
  };
};

function selectionContractSourcePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "novelHoldoutFrozenSetV1SelectionContract.ts");
}

function isSortedAscending(ids: readonly string[]): boolean {
  for (let index = 1; index < ids.length; index += 1) {
    if (ids[index]! < ids[index - 1]!) {
      return false;
    }
  }
  return true;
}

function cloneGateRows(
  rows: readonly FrozenSetV1GateRowResult[],
): FrozenSetV1GateRowResult[] {
  return rows.map((row) => ({
    ...row,
    novelty: { ...row.novelty, reasons: [...row.novelty.reasons] },
    leakage: {
      ...row.leakage,
      findings: row.leakage.findings.map((f) => ({ ...f })),
    },
    declaredNoveltyTier: [...row.declaredNoveltyTier],
  }));
}

function withSyntheticReject(
  gate: FrozenSetV1GateVerificationResult,
  rejectSlotId: string,
): FrozenSetV1GateVerificationResult {
  const rows = cloneGateRows(gate.rows).map((row) => {
    if (row.slotId !== rejectSlotId) return row;
    return {
      ...row,
      overallBucket: "REJECT" as const,
      novelty: {
        ...row.novelty,
        bucket: "REJECT" as const,
        status: "REJECT" as const,
        reasons: [...row.novelty.reasons, "synthetic-reject-for-selection-test"],
      },
    };
  });

  return {
    ...gate,
    gateReady: false,
    overallPassed: false,
    noveltyPassed: false,
    rows,
    acceptedCount: rows.filter((r) => r.overallBucket === "PASS").length,
    reviewCount: rows.filter((r) => r.overallBucket === "REVIEW").length,
    rejectedCount: rows.filter((r) => r.overallBucket === "REJECT").length,
  };
}

function withForcedReview(
  gate: FrozenSetV1GateVerificationResult,
  reviewSlotId: string,
): FrozenSetV1GateVerificationResult {
  const rows = cloneGateRows(gate.rows).map((row) => {
    if (row.slotId !== reviewSlotId) return row;
    return {
      ...row,
      overallBucket: "REVIEW" as const,
      leakage: {
        ...row.leakage,
        bucket: "REVIEW" as const,
        status: "SOFT_FLAG_ONLY" as const,
        softFlagCount: Math.max(1, row.leakage.softFlagCount),
      },
    };
  });

  return {
    ...gate,
    rows,
    acceptedCount: rows.filter((r) => r.overallBucket === "PASS").length,
    reviewCount: rows.filter((r) => r.overallBucket === "REVIEW").length,
    rejectedCount: rows.filter((r) => r.overallBucket === "REJECT").length,
    // REVIEW alone does not clear readiness when no REJECT.
    gateReady: gate.gateReady && rows.every((r) => r.overallBucket !== "REJECT"),
  };
}

export function verifyNovelHoldoutFrozenSetV1Selection(
  gate: FrozenSetV1GateVerificationResult = verifyNovelHoldoutFrozenSetV1Gates(),
): FrozenSetV1SelectionVerificationResult {
  const questionsBefore = NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS.length;
  const goldBefore = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.length;
  const slotPlanBefore = NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN.length;
  const seedSlotsBefore = NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length;
  const questionSnapshot = NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS.map(
    (q) => q.question,
  );
  const goldAxisSnapshot = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.map((row) =>
    [
      row.slotId,
      row.gold.expectedTopic,
      row.gold.expectedIntent,
      row.gold.expectedDecisionTarget,
      row.gold.expectedTimingType ?? "",
    ].join("\u001f"),
  );

  const selection = selectNovelHoldoutFrozenSetV1({
    gate: snapshotGateForSelection(gate),
    allocation: NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
    join: {
      questions: NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
      goldRows: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
    },
  });

  const selectionAgain = selectNovelHoldoutFrozenSetV1({
    gate: snapshotGateForSelection(gate),
    allocation: NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION,
    join: {
      questions: NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
      goldRows: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
    },
  });

  const eligibleFromGate = gate.gateReady
    ? gate.rows
      .filter((r) => r.overallBucket === "PASS" || r.overallBucket === "REVIEW")
      .map((r) => r.slotId)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    : [];

  const rejectFromGate = gate.rows
    .filter((r) => r.overallBucket === "REJECT")
    .map((r) => r.slotId);

  const selectedSet = new Set(selection.selectedSlotIds);
  const excludedSet = new Set(selection.excludedSlotIds);
  const overlap = selection.selectedSlotIds.filter((id) => excludedSet.has(id));

  const fingerprintRecheck = computeFrozenSetV1SelectionFingerprint({
    selectionRevision: selection.selectionRevision,
    gateReady: selection.gateReady,
    eligibleSlotIds: selection.eligibleSlotIds,
    selectedSlotIds: selection.selectedSlotIds,
    excludedSlotIds: selection.excludedSlotIds,
  });

  const contractSourceRaw = readFileSync(selectionContractSourcePath(), "utf8");
  const contractSource = contractSourceRaw
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ");

  // Executable code must not read Gold expected axes for ranking/eligibility.
  const usesGoldAxesAsCriterion =
    /\.expectedTopic\b|\.expectedIntent\b|\.expectedDecisionTarget\b|\.expectedTimingType\b/
      .test(contractSource)
    || /join\.goldRows/.test(contractSource)
      && /expectedTopic|expectedIntent|expectedDecisionTarget/.test(
        contractSource,
      );

  const reRunsGates =
    /evaluateNovelHoldoutNoveltyGate|evaluateNovelHoldoutLeakageGate/.test(
      contractSource,
    );

  const voidsJoinBookkeeping = /void\s+input\.join\b/.test(contractSource);

  const cases: FrozenSetV1SelectionVerificationCase[] = [];

  cases.push({
    id: "gateReady-eligible-only-input",
    passed:
      selection.gateReady === gate.gateReady
      && selection.eligibleSlotIds.join(",") === eligibleFromGate.join(",")
      && selection.eligibleCount === eligibleFromGate.length,
    details: [
      `gateReady=${selection.gateReady}`,
      `eligibleCount=${selection.eligibleCount}`,
      `expectedEligible=${eligibleFromGate.length}`,
    ],
  });

  cases.push({
    id: "gate-reject-not-selected",
    passed: rejectFromGate.every((id) => !selectedSet.has(id)),
    details: [
      `rejectCount=${rejectFromGate.length}`,
      `rejectInSelected=${rejectFromGate.filter((id) => selectedSet.has(id)).length}`,
    ],
  });

  // Synthetic REJECT must never be selected (and clears gateReady → empty pass-through).
  {
    const probeSlot = gate.rows[0]?.slotId;
    let syntheticOk = probeSlot != null;
    let details = ["no-rows"];
    if (probeSlot) {
      const syntheticGate = withSyntheticReject(gate, probeSlot);
      const syntheticSelection = selectNovelHoldoutFrozenSetV1({
        gate: snapshotGateForSelection(syntheticGate),
      });
      syntheticOk =
        !syntheticSelection.selectedSlotIds.includes(probeSlot)
        && syntheticSelection.gateRejectedSlotIds.includes(probeSlot)
        && syntheticSelection.gateReady === false
        && syntheticSelection.selectedCount === 0;
      details = [
        `probeSlot=${probeSlot}`,
        `selectedCount=${syntheticSelection.selectedCount}`,
        `gateReady=${syntheticSelection.gateReady}`,
        `inGateRejected=${syntheticSelection.gateRejectedSlotIds.includes(probeSlot)}`,
      ];
    }
    cases.push({
      id: "synthetic-reject-excluded-from-selection-input",
      passed: syntheticOk,
      details,
    });
  }

  // PASS + REVIEW remain eligible candidates when gateReady.
  {
    const probeSlot = gate.rows[0]?.slotId;
    let reviewOk = probeSlot != null && gate.gateReady;
    let details = ["no-rows-or-not-ready"];
    if (probeSlot && gate.gateReady) {
      const reviewGate = withForcedReview(gate, probeSlot);
      const reviewSelection = selectNovelHoldoutFrozenSetV1({
        gate: snapshotGateForSelection(reviewGate),
      });
      reviewOk =
        reviewSelection.eligibleSlotIds.includes(probeSlot)
        && reviewSelection.selectedSlotIds.includes(probeSlot);
      details = [
        `probeSlot=${probeSlot}`,
        `eligible=${reviewSelection.eligibleSlotIds.includes(probeSlot)}`,
        `selected=${reviewSelection.selectedSlotIds.includes(probeSlot)}`,
        `reviewCount=${reviewGate.reviewCount}`,
      ];
    }
    cases.push({
      id: "pass-and-review-are-selection-candidates",
      passed: reviewOk,
      details,
    });
  }

  cases.push({
    id: "current-pool-all-selected",
    passed:
      gate.gateReady
      && gate.total === 160
      && selection.selectedCount === 160
      && selection.selectedSlotIds.length === 160
      && selection.excludedSlotIds.length === 0,
    details: [
      `gateReady=${gate.gateReady}`,
      `gateTotal=${gate.total}`,
      `selectedCount=${selection.selectedCount}`,
      `excludedCount=${selection.excludedSlotIds.length}`,
    ],
  });

  cases.push({
    id: "selectedSlotIds-unique",
    passed: selectedSet.size === selection.selectedSlotIds.length,
    details: [
      `count=${selection.selectedSlotIds.length}`,
      `unique=${selectedSet.size}`,
    ],
  });

  cases.push({
    id: "selectedSlotIds-sorted",
    passed: isSortedAscending(selection.selectedSlotIds),
    details: [
      `first=${selection.selectedSlotIds[0] ?? ""}`,
      `last=${selection.selectedSlotIds[selection.selectedSlotIds.length - 1] ?? ""}`,
    ],
  });

  cases.push({
    id: "selectedCount-matches-ids",
    passed: selection.selectedCount === selection.selectedSlotIds.length,
    details: [
      `selectedCount=${selection.selectedCount}`,
      `ids=${selection.selectedSlotIds.length}`,
    ],
  });

  cases.push({
    id: "excluded-and-selected-disjoint",
    passed: overlap.length === 0,
    details: [`overlap=${overlap.length}`],
  });

  cases.push({
    id: "deterministic-same-input-same-output",
    passed:
      selection.selectedSlotIds.join(",")
        === selectionAgain.selectedSlotIds.join(",")
      && selection.selectionFingerprint
        === selectionAgain.selectionFingerprint
      && selection.excludedSlotIds.join(",")
        === selectionAgain.excludedSlotIds.join(","),
    details: [
      `fingerprintA=${selection.selectionFingerprint}`,
      `fingerprintB=${selectionAgain.selectionFingerprint}`,
    ],
  });

  cases.push({
    id: "fingerprint-deterministic",
    passed:
      selection.selectionFingerprint === fingerprintRecheck
      && selection.selectionRevision
        === NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION,
    details: [
      `fingerprint=${selection.selectionFingerprint}`,
      `recheck=${fingerprintRecheck}`,
      `revision=${selection.selectionRevision}`,
    ],
  });

  cases.push({
    id: "gold-expected-axes-not-selection-criterion",
    passed: !usesGoldAxesAsCriterion && voidsJoinBookkeeping,
    details: [
      `usesGoldAxesAsCriterion=${usesGoldAxesAsCriterion}`,
      `voidsJoinBookkeeping=${voidsJoinBookkeeping}`,
      "join materials accepted for bookkeeping only",
    ],
  });

  cases.push({
    id: "gates-not-rerun-in-selection",
    passed: selection.gatesReRun === false && !reRunsGates,
    details: [
      `gatesReRun=${selection.gatesReRun}`,
      `contractImportsGateEvaluators=${reRunsGates}`,
    ],
  });

  cases.push({
    id: "readerExecuted-false",
    passed: selection.readerExecuted === false,
    details: [`readerExecuted=${selection.readerExecuted}`],
  });

  cases.push({
    id: "gatesReRun-false",
    passed: selection.gatesReRun === false,
    details: [`gatesReRun=${selection.gatesReRun}`],
  });

  // totalMin is report-only guidance (not a Selection hard FAIL).
  // At 160, floor is met: observe satisfied floor + no total_min shortfall.
  const totalMinFloorMetReportOnly =
    selection.softGapReport.selectedCount === 160
    && selection.softGapReport.targetMin === 160
    && selection.softGapReport.totalMinGap === 0
    && !selection.softGapReport.softGuidanceShortfalls.some(
      (s) => s.kind === "total_min",
    );

  cases.push({
    id: "totalMin-shortfall-is-report-not-fail",
    passed: totalMinFloorMetReportOnly,
    details: [
      `totalMinGap=${selection.softGapReport.totalMinGap}`,
      `targetMin=${selection.softGapReport.targetMin}`,
      `selectedCount=${selection.softGapReport.selectedCount}`,
      `totalMinShortfallPresent=${
        selection.softGapReport.softGuidanceShortfalls.some(
          (s) => s.kind === "total_min",
        )
      }`,
      `shortfalls=${selection.softGapReport.softGuidanceShortfalls.length}`,
    ],
  });

  const familySoftMinReported = selection.softGapReport.familySoftGaps.some(
    (g) => g.softMinGap > 0,
  )
    ? selection.softGapReport.softGuidanceShortfalls.some(
      (s) => s.kind === "family_soft_min",
    )
    : true;

  cases.push({
    id: "family-softMin-shortfall-is-report-not-fail",
    passed: familySoftMinReported,
    details: [
      `familySoftMinShortfalls=${
        selection.softGapReport.softGuidanceShortfalls.filter(
          (s) => s.kind === "family_soft_min",
        ).length
      }`,
    ],
  });

  cases.push({
    id: "current-pass-through-within-total-max",
    passed:
      selection.selectedCount <= NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.total.max
      && selection.softGapReport.totalMaxHeadroom === 40
      && selection.softGapReport.targetMax === 200,
    details: [
      `selectedCount=${selection.selectedCount}`,
      `totalMax=${NOVEL_HOLDOUT_FROZEN_SET_V1_ALLOCATION.total.max}`,
      `totalMaxHeadroom=${selection.softGapReport.totalMaxHeadroom}`,
    ],
  });

  const generalGap = selection.softGapReport.familySoftGaps.find(
    (g) => g.family === "general",
  );
  cases.push({
    id: "general-softMax-filled-no-selection-headroom",
    passed:
      generalGap != null
      && generalGap.softMax === 10
      && generalGap.selected === 10
      && generalGap.softMaxHeadroom === 0,
    details: [
      `general.selected=${generalGap?.selected ?? -1}`,
      `general.softMax=${generalGap?.softMax ?? -1}`,
      `general.softMaxHeadroom=${generalGap?.softMaxHeadroom ?? -1}`,
    ],
  });

  const questionsAfter = NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS.length;
  const goldAfter = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.length;
  const slotPlanAfter = NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN.length;
  const seedSlotsAfter = NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.length;
  const questionUnchanged = questionSnapshot.every(
    (q, index) => NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS[index]?.question === q,
  );
  const goldUnchanged = goldAxisSnapshot.every(
    (line, index) => {
      const row = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD[index];
      if (!row) return false;
      return (
        [
          row.slotId,
          row.gold.expectedTopic,
          row.gold.expectedIntent,
          row.gold.expectedDecisionTarget,
          row.gold.expectedTimingType ?? "",
        ].join("\u001f") === line
      );
    },
  );

  cases.push({
    id: "source-artifacts-not-mutated",
    passed:
      questionsBefore === questionsAfter
      && goldBefore === goldAfter
      && slotPlanBefore === slotPlanAfter
      && seedSlotsBefore === seedSlotsAfter
      && questionsBefore === 160
      && goldBefore === 160
      && slotPlanBefore === 222
      && questionUnchanged
      && goldUnchanged
      && NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS
        === NOVEL_HOLDOUT_FROZEN_SET_V1_SLOT_PLAN,
    details: [
      `questions=${questionsAfter}`,
      `gold=${goldAfter}`,
      `slotPlan=${slotPlanAfter}`,
      `seedSlots=${seedSlotsAfter}`,
      `questionUnchanged=${questionUnchanged}`,
      `goldUnchanged=${goldUnchanged}`,
    ],
  });

  const checks: Record<string, boolean> = {};
  for (const verificationCase of cases) {
    checks[verificationCase.id] = verificationCase.passed;
  }

  return {
    step: "FSV1-SELECTION",
    passed: cases.every((c) => c.passed),
    gateReady: gate.gateReady,
    selectedCount: selection.selectedCount,
    selectedSlotIds: selection.selectedSlotIds,
    excludedSlotIds: selection.excludedSlotIds,
    selectionFingerprint: selection.selectionFingerprint,
    softGapReport: selection.softGapReport,
    readerExecuted: false,
    gatesReRun: false,
    cases,
    checks,
    gateSummary: {
      total: gate.total,
      acceptedCount: gate.acceptedCount,
      reviewCount: gate.reviewCount,
      rejectedCount: gate.rejectedCount,
      novelty: gate.novelty,
      leakage: gate.leakage,
    },
  };
}

export function serializeNovelHoldoutFrozenSetV1SelectionVerificationResult(
  result: FrozenSetV1SelectionVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      gateReady: result.gateReady,
      selectedCount: result.selectedCount,
      excludedCount: result.excludedSlotIds.length,
      selectionFingerprint: result.selectionFingerprint,
      readerExecuted: result.readerExecuted,
      gatesReRun: result.gatesReRun,
      softGapReport: {
        selectedCount: result.softGapReport.selectedCount,
        targetMin: result.softGapReport.targetMin,
        targetMax: result.softGapReport.targetMax,
        totalMinGap: result.softGapReport.totalMinGap,
        totalMaxHeadroom: result.softGapReport.totalMaxHeadroom,
        familyDistribution: result.softGapReport.familyDistribution,
        familySoftGaps: result.softGapReport.familySoftGaps,
        taxonomyDistribution: result.softGapReport.taxonomyDistribution,
        noveltyTierDistribution: result.softGapReport.noveltyTierDistribution,
        softGuidanceShortfallCount:
          result.softGapReport.softGuidanceShortfalls.length,
        softGuidanceShortfalls: result.softGapReport.softGuidanceShortfalls,
      },
      gateSummary: result.gateSummary,
      checks: result.checks,
      cases: result.cases,
      selectedSlotIds: result.selectedSlotIds,
      excludedSlotIds: result.excludedSlotIds,
    },
    null,
    2,
  );
}
