/**
 * Frozen Set v1 — Sealed Freeze verification (verification-only).
 *
 * Confirms Selection handoff + Q/G/Slot 1:1 projection + common Freeze
 * Contract manifest integrity, with Reader remaining NOT RUN.
 *
 * Forbidden:
 * - family softMin/softMax / taxonomy share / novelty share / totalMax=200 hard asserts
 * - acceptedCount === 153 regression snapshot
 * - QuestionReader / DecisionEngine execution
 * - Question / Gold / Selection / Gate source mutation
 */

import {
  computeNovelHoldoutContentHash,
} from "./novelHoldoutFreezeContract.js";
import {
  buildFrozenSetV1FreezeSnapshot,
  NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_HARD_MIN,
  NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_PROVENANCE,
  NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
  NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT,
  type FrozenSetV1FreezeSnapshot,
} from "./novelHoldoutFrozenSetV1Freeze.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION,
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE,
} from "./novelHoldoutFrozenSetV1Gold.js";
import {
  verifyNovelHoldoutFrozenSetV1Gates,
} from "./novelHoldoutFrozenSetV1GateVerification.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
} from "./novelHoldoutFrozenSetV1Questions.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION,
  selectNovelHoldoutFrozenSetV1,
  snapshotGateForSelection,
} from "./novelHoldoutFrozenSetV1SelectionContract.js";

export type FrozenSetV1FreezeVerificationCase = {
  id: string;
  passed: boolean;
  details: readonly string[];
};

export type FrozenSetV1FreezeVerificationResult = {
  step: "FSV1-FREEZE";
  freezeRevision: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION;
  passed: boolean;
  sealed: boolean;
  selectedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  draftExcludedCount: number;
  rowCount: number;
  contentHash: string;
  selectionRevision: string;
  selectionFingerprint: string;
  gateReady: boolean;
  goldStage: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE;
  reader: "NOT RUN";
  readerExecuted: false;
  cases: readonly FrozenSetV1FreezeVerificationCase[];
  checks: Readonly<Record<string, boolean>>;
};

function isSortedAscending(ids: readonly string[]): boolean {
  for (let index = 1; index < ids.length; index += 1) {
    if (ids[index]! < ids[index - 1]!) {
      return false;
    }
  }
  return true;
}

function distributionsEqual(
  left: Readonly<Record<string, number>>,
  right: Readonly<Record<string, number>>,
): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  for (let index = 0; index < leftKeys.length; index += 1) {
    const key = leftKeys[index]!;
    if (key !== rightKeys[index]) return false;
    if ((left[key] ?? 0) !== (right[key] ?? 0)) return false;
  }
  return true;
}

function distributionFromAcceptedRows(
  rows: FrozenSetV1FreezeSnapshot["acceptedRows"],
): {
  taxonomy: Record<string, number>;
  novelty: Record<string, number>;
  family: Record<string, number>;
} {
  const taxonomy: Record<string, number> = {};
  const novelty: Record<string, number> = {};
  const family: Record<string, number> = {};
  for (const row of rows) {
    taxonomy[row.taxonomyPrimary] = (taxonomy[row.taxonomyPrimary] ?? 0) + 1;
    family[row.family] = (family[row.family] ?? 0) + 1;
    for (const tier of row.noveltyTier) {
      novelty[tier] = (novelty[tier] ?? 0) + 1;
    }
  }
  return { taxonomy, novelty, family };
}

export function verifyNovelHoldoutFrozenSetV1Freeze(
  snapshot: FrozenSetV1FreezeSnapshot = buildFrozenSetV1FreezeSnapshot(),
): FrozenSetV1FreezeVerificationResult {
  const gate = verifyNovelHoldoutFrozenSetV1Gates();
  const selection = selectNovelHoldoutFrozenSetV1({
    gate: snapshotGateForSelection(gate),
    join: {
      questions: NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
      goldRows: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
    },
  });

  const live = snapshot;
  const manifest = live.frozenSetManifest;
  const cases: FrozenSetV1FreezeVerificationCase[] = [];

  const selectedNonempty = selection.selectedSlotIds.length > 0;
  cases.push({
    id: "selectedSlotIds-nonempty",
    passed: selectedNonempty,
    details: [`selectedSlotIds.length=${selection.selectedSlotIds.length}`],
  });

  const selectedHardMin =
    selection.selectedCount >= NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_HARD_MIN;
  cases.push({
    id: "selectedCount-hard-min-160",
    passed: selectedHardMin,
    details: [
      `selectedCount=${selection.selectedCount}`,
      `hardMin=${NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_HARD_MIN}`,
    ],
  });

  const gateReadyOk = selection.gateReady === true;
  cases.push({
    id: "gateReady-true",
    passed: gateReadyOk,
    details: [`gateReady=${selection.gateReady}`],
  });

  const readerFalse =
    selection.readerExecuted === false && live.readerExecuted === false;
  cases.push({
    id: "readerExecuted-false",
    passed: readerFalse,
    details: [
      `selection.readerExecuted=${selection.readerExecuted}`,
      `freeze.readerExecuted=${live.readerExecuted}`,
    ],
  });

  const gatesNotRerun =
    selection.gatesReRun === false && live.gatesReRun === false;
  cases.push({
    id: "gatesReRun-false",
    passed: gatesNotRerun,
    details: [
      `selection.gatesReRun=${selection.gatesReRun}`,
      `freeze.gatesReRun=${live.gatesReRun}`,
    ],
  });

  const selectionRevisionPresent =
    typeof selection.selectionRevision === "string"
    && selection.selectionRevision.length > 0
    && selection.selectionRevision === NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION;
  cases.push({
    id: "selectionRevision-present",
    passed: selectionRevisionPresent,
    details: [`selectionRevision=${selection.selectionRevision}`],
  });

  const selectionFingerprintPresent =
    typeof selection.selectionFingerprint === "string"
    && selection.selectionFingerprint.length > 0;
  cases.push({
    id: "selectionFingerprint-present",
    passed: selectionFingerprintPresent,
    details: [`selectionFingerprint=${selection.selectionFingerprint}`],
  });

  const freezeRevisionText: string = live.freezeRevision;
  const selectionRevisionText: string = selection.selectionRevision;
  const goldRevisionText: string = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION;
  const placeholderRevisionText: string =
    NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_PROVENANCE.placeholderRevision;
  const revisionIndependence =
    freezeRevisionText === NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION
    && freezeRevisionText !== selectionRevisionText
    && freezeRevisionText !== goldRevisionText
    && freezeRevisionText !== placeholderRevisionText
    && selectionRevisionText !== freezeRevisionText
    && goldRevisionText !== freezeRevisionText;
  cases.push({
    id: "revision-independence",
    passed: revisionIndependence,
    details: [
      `freezeRevision=${live.freezeRevision}`,
      `selectionRevision=${selection.selectionRevision}`,
      `goldRevision=${NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION}`,
      `placeholder=${NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_PROVENANCE.placeholderRevision}`,
    ],
  });

  const goldStageOk = NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.every(
    (row) => row.stage === NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE,
  );
  cases.push({
    id: "gold-stage-GOLD_SEALED",
    passed: goldStageOk,
    details: [
      `expected=${NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE}`,
      `goldCount=${NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.length}`,
    ],
  });

  const questionCountOk =
    NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS.length === selection.selectedCount
    && live.questionCount === selection.selectedCount;
  cases.push({
    id: "question-count-equals-selectedCount",
    passed: questionCountOk,
    details: [
      `questions=${NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS.length}`,
      `freeze.questionCount=${live.questionCount}`,
      `selectedCount=${selection.selectedCount}`,
    ],
  });

  const goldCountOk =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.length === selection.selectedCount
    && live.goldCount === selection.selectedCount;
  cases.push({
    id: "gold-count-equals-selectedCount",
    passed: goldCountOk,
    details: [
      `gold=${NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.length}`,
      `freeze.goldCount=${live.goldCount}`,
      `selectedCount=${selection.selectedCount}`,
    ],
  });

  const joinViolations: string[] = [];
  const selectedUnique = new Set(selection.selectedSlotIds);
  if (selectedUnique.size !== selection.selectedSlotIds.length) {
    joinViolations.push("selectedSlotIds not unique");
  }

  const qBySlot = new Map(
    NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS.map((q) => [q.slotId, q]),
  );
  const gBySlot = new Map(
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD.map((g) => [g.slotId, g]),
  );

  for (const slotId of selection.selectedSlotIds) {
    const q = qBySlot.get(slotId);
    const g = gBySlot.get(slotId);
    if (!q) joinViolations.push(`missing Question for ${slotId}`);
    if (!g) joinViolations.push(`missing Gold for ${slotId}`);
    if (q && g) {
      if (q.slotId !== g.slotId) {
        joinViolations.push(`${slotId}: Q/G slotId mismatch`);
      }
      if (q.question !== g.question) {
        joinViolations.push(`${slotId}: Q/G question text mismatch`);
      }
      if (q.family !== g.family || q.taxonomyPrimary !== g.taxonomyPrimary) {
        joinViolations.push(`${slotId}: Q/G metadata mismatch`);
      }
    }
  }

  const oneToOneOk = joinViolations.length === 0 && live.joinErrors.length === 0;
  cases.push({
    id: "qg-slot-one-to-one",
    passed: oneToOneOk,
    details: [
      `joinViolations=${joinViolations.length}`,
      `freeze.joinErrors=${live.joinErrors.length}`,
      ...joinViolations.slice(0, 8),
      ...live.joinErrors.slice(0, 4).map((e) => `${e.slotId}:${e.reason}`),
    ],
  });

  const projectedCountOk =
    live.acceptedRows.length === selection.selectedCount;
  cases.push({
    id: "projected-row-count",
    passed: projectedCountOk,
    details: [
      `acceptedRows=${live.acceptedRows.length}`,
      `selectedCount=${selection.selectedCount}`,
    ],
  });

  const rowIds = live.acceptedRows.map((row) => row.id);
  const noDuplicateRowIds = new Set(rowIds).size === rowIds.length;
  cases.push({
    id: "no-duplicate-row-id",
    passed: noDuplicateRowIds,
    details: [`rowIds=${rowIds.length}`, `unique=${new Set(rowIds).size}`],
  });

  const acceptedCountOk = manifest.acceptedCount === selection.selectedCount;
  cases.push({
    id: "acceptedCount-equals-selectedCount",
    passed: acceptedCountOk,
    details: [
      `acceptedCount=${manifest.acceptedCount}`,
      `selectedCount=${selection.selectedCount}`,
    ],
  });

  const rejectedZero = manifest.rejectedCount === 0;
  cases.push({
    id: "rejectedCount-zero",
    passed: rejectedZero,
    details: [`rejectedCount=${manifest.rejectedCount}`],
  });

  const draftExcludedZero = manifest.draftExcludedCount === 0;
  cases.push({
    id: "draftExcludedCount-zero",
    passed: draftExcludedZero,
    details: [`draftExcludedCount=${manifest.draftExcludedCount}`],
  });

  const rowCountEqualsAccepted = manifest.rowCount === manifest.acceptedCount;
  cases.push({
    id: "manifest-rowCount-equals-acceptedCount",
    passed: rowCountEqualsAccepted,
    details: [
      `rowCount=${manifest.rowCount}`,
      `acceptedCount=${manifest.acceptedCount}`,
    ],
  });

  const acceptedRowIdsSorted =
    manifest.acceptedRowIds.length === manifest.acceptedCount
    && isSortedAscending(manifest.acceptedRowIds)
    && manifest.acceptedRowIds.every((id, index) => {
      const expected = [...rowIds].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      return id === expected[index];
    });
  cases.push({
    id: "acceptedRowIds-deterministic-sorted",
    passed: acceptedRowIdsSorted,
    details: [
      `acceptedRowIds.length=${manifest.acceptedRowIds.length}`,
      `first=${manifest.acceptedRowIds[0] ?? ""}`,
      `last=${manifest.acceptedRowIds[manifest.acceptedRowIds.length - 1] ?? ""}`,
    ],
  });

  const contentHashPresent =
    typeof manifest.contentHash === "string"
    && manifest.contentHash.length > 0;
  cases.push({
    id: "contentHash-present",
    passed: contentHashPresent,
    details: [`contentHash=${manifest.contentHash}`],
  });

  const recomputedHash = computeNovelHoldoutContentHash(live.acceptedRows);
  const contentHashMatch = recomputedHash === manifest.contentHash;
  cases.push({
    id: "contentHash-recompute",
    passed: contentHashMatch,
    details: [
      `manifest=${manifest.contentHash}`,
      `recomputed=${recomputedHash}`,
    ],
  });

  const frozenRevisionOnRows = live.acceptedRows.every(
    (row) => row.frozenRevision === NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
  );
  const manifestFrozenRevisionText: string = manifest.frozenRevision;
  const frozenRevisionDistinct =
    manifestFrozenRevisionText === NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION
    && manifestFrozenRevisionText !== goldRevisionText
    && manifestFrozenRevisionText !== selectionRevisionText
    && frozenRevisionOnRows;
  cases.push({
    id: "frozenRevision-distinct",
    passed: frozenRevisionDistinct,
    details: [
      `manifest.frozenRevision=${manifest.frozenRevision}`,
      `rowsAllMatch=${frozenRevisionOnRows}`,
    ],
  });

  const fromRows = distributionFromAcceptedRows(live.acceptedRows);
  const distributionsMatch =
    distributionsEqual(manifest.taxonomyDistribution, fromRows.taxonomy)
    && distributionsEqual(manifest.noveltyTierDistribution, fromRows.novelty)
    && distributionsEqual(manifest.familyDistribution, fromRows.family);
  cases.push({
    id: "distributions-match-accepted-rows",
    passed: distributionsMatch,
    details: [
      `taxonomyKeys=${Object.keys(manifest.taxonomyDistribution).length}`,
      `familyKeys=${Object.keys(manifest.familyDistribution).length}`,
      `noveltyKeys=${Object.keys(manifest.noveltyTierDistribution).length}`,
    ],
  });

  const readerBoundary =
    live.readerExecuted === false
    && live.readerActualAttached === false
    && selection.readerExecuted === false;
  cases.push({
    id: "reader-boundary",
    passed: readerBoundary,
    details: [
      `readerExecuted=${live.readerExecuted}`,
      `readerActualAttached=${live.readerActualAttached}`,
      `reader=NOT RUN`,
    ],
  });

  const sealedOk = live.sealed === true;
  cases.push({
    id: "sealed-true",
    passed: sealedOk,
    details: [`sealed=${live.sealed}`],
  });

  // Live module snapshot must match freshly built snapshot (no drift).
  const moduleSnapshotOk =
    NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT.sealed === true
    && NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT.frozenSetManifest.contentHash
      === manifest.contentHash
    && NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT.freezeRevision
      === live.freezeRevision;
  cases.push({
    id: "module-snapshot-matches-live",
    passed: moduleSnapshotOk,
    details: [
      `module.sealed=${NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT.sealed}`,
      `module.contentHash=${NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT.frozenSetManifest.contentHash}`,
    ],
  });

  const checks: Record<string, boolean> = {};
  for (const item of cases) {
    checks[item.id] = item.passed;
  }

  const passed = cases.every((item) => item.passed);

  return {
    step: "FSV1-FREEZE",
    freezeRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
    passed,
    sealed: live.sealed,
    selectedCount: selection.selectedCount,
    acceptedCount: manifest.acceptedCount,
    rejectedCount: manifest.rejectedCount,
    draftExcludedCount: manifest.draftExcludedCount,
    rowCount: manifest.rowCount,
    contentHash: manifest.contentHash,
    selectionRevision: selection.selectionRevision,
    selectionFingerprint: selection.selectionFingerprint,
    gateReady: selection.gateReady,
    goldStage: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE,
    reader: "NOT RUN",
    readerExecuted: false,
    cases,
    checks,
  };
}

export function serializeNovelHoldoutFrozenSetV1FreezeVerificationResult(
  result: FrozenSetV1FreezeVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      freezeRevision: result.freezeRevision,
      sealed: result.sealed,
      selectedCount: result.selectedCount,
      acceptedCount: result.acceptedCount,
      rejectedCount: result.rejectedCount,
      draftExcludedCount: result.draftExcludedCount,
      rowCount: result.rowCount,
      contentHash: result.contentHash,
      selectionRevision: result.selectionRevision,
      selectionFingerprint: result.selectionFingerprint,
      gateReady: result.gateReady,
      goldStage: result.goldStage,
      reader: result.reader,
      readerExecuted: result.readerExecuted,
      checks: result.checks,
      cases: result.cases,
    },
    null,
    2,
  );
}
