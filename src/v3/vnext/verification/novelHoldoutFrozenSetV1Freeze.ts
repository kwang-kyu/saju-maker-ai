/**
 * Frozen Set v1 — Sealed Freeze (verification-only).
 *
 * Binds Selection selectedSlotIds (source of truth) + Question + Gold
 * into a sealed NovelHoldoutFrozenSetManifest via the common Freeze Contract.
 *
 * Forbidden:
 * - Re-running Novelty / Leakage gates
 * - Reader / DecisionEngine execution
 * - Soft-gap / share / totalMax hard quotas
 * - Mutating Question / Gold / Selection / Gate sources
 * - Blind Holdout v1 50-quota / family-prefix literals
 */

import type { NovelHoldoutRow } from "./novelHoldoutContract.js";
import {
  buildNovelHoldoutFrozenSetManifest,
  type NovelHoldoutFreezeCandidateRecord,
  type NovelHoldoutFrozenSetManifest,
} from "./novelHoldoutFreezeContract.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION,
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE,
  type NovelHoldoutFrozenSetV1GoldRow,
} from "./novelHoldoutFrozenSetV1Gold.js";
import {
  verifyNovelHoldoutFrozenSetV1Gates,
} from "./novelHoldoutFrozenSetV1GateVerification.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
  type NovelHoldoutFrozenSetV1AuthoredQuestion,
} from "./novelHoldoutFrozenSetV1Questions.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION,
  selectNovelHoldoutFrozenSetV1,
  snapshotGateForSelection,
  type FrozenSetV1SelectionResult,
} from "./novelHoldoutFrozenSetV1SelectionContract.js";

/**
 * FSV1-only sealed freeze revision.
 * Independent from Gold revision and Selection revision.
 * Does NOT reuse the common placeholder `frozen-set-v1-unsealed-p11-3`.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION =
  "frozen-set-v1-sealed-r1" as const;

export type NovelHoldoutFrozenSetV1FreezeRevision =
  typeof NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION;

/** P2 Freeze hard minimum — sealed freeze requires selectedCount >= 160. */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_HARD_MIN = 160 as const;

export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_QUESTION_SOURCE =
  "src/v3/vnext/verification/novelHoldoutFrozenSetV1Questions.ts" as const;

export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_GOLD_SOURCE =
  "src/v3/vnext/verification/novelHoldoutFrozenSetV1Gold.ts" as const;

export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_STAGE = "FROZEN" as const;

export type FrozenSetV1FreezeJoinError = {
  slotId: string;
  reason: string;
};

export type FrozenSetV1FreezeProjection = {
  selectedSlotIds: readonly string[];
  selectedCount: number;
  questions: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[];
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[];
  acceptedRows: readonly NovelHoldoutRow[];
  records: readonly NovelHoldoutFreezeCandidateRecord[];
  joinErrors: readonly FrozenSetV1FreezeJoinError[];
};

export type FrozenSetV1FreezeSnapshot = {
  freezeRevision: NovelHoldoutFrozenSetV1FreezeRevision;
  stage: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_STAGE;
  sealed: boolean;
  questionSource: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_QUESTION_SOURCE;
  goldSource: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_GOLD_SOURCE;
  selectedSlotIds: readonly string[];
  selectedCount: number;
  selectionRevision: FrozenSetV1SelectionResult["selectionRevision"];
  selectionFingerprint: string;
  gateReady: boolean;
  gatesReRun: false;
  goldRevision: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION;
  goldStage: typeof NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE;
  questionCount: number;
  goldCount: number;
  acceptedRows: readonly NovelHoldoutRow[];
  records: readonly NovelHoldoutFreezeCandidateRecord[];
  frozenSetManifest: NovelHoldoutFrozenSetManifest;
  joinErrors: readonly FrozenSetV1FreezeJoinError[];
  /**
   * Reader observation is intentionally absent at freeze time.
   */
  readerExecuted: false;
  readerActualAttached: false;
};

function compareSlotId(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Project one FSV1 Gold row onto NovelHoldoutRow for the shared freeze contract.
 * Does not mutate Gold / Question sources.
 */
export function toFrozenSetV1FrozenNovelHoldoutRow(
  goldRow: NovelHoldoutFrozenSetV1GoldRow,
  freezeRevision: NovelHoldoutFrozenSetV1FreezeRevision =
    NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
): NovelHoldoutRow {
  const g = goldRow.gold;
  return {
    id: goldRow.slotId,
    family: goldRow.family,
    taxonomyPrimary: goldRow.taxonomyPrimary,
    taxonomySecondary: goldRow.slot.taxonomySecondary,
    noveltyTier: goldRow.noveltyTier,
    question: goldRow.question,
    expectedTopic: g.expectedTopic,
    expectedIntent: g.expectedIntent,
    expectedDecisionTarget: g.expectedDecisionTarget,
    expectedTimingType: g.expectedTimingType,
    expectedAnalysisMode: g.expectedAnalysisMode,
    matchPolicy: g.matchPolicy,
    goldConfidence: g.goldConfidence,
    goldRationale: g.goldRationale,
    ambiguityLabel: g.ambiguityLabel,
    compositeNote: g.compositeNote,
    boundaryAgainst: g.boundaryAgainst ?? goldRow.slot.boundaryAgainst,
    frozenRevision: freezeRevision,
  };
}

/**
 * Join Selection selectedSlotIds → Question → Gold (1:1).
 * Selection selectedSlotIds is the sole source of truth for the candidate set.
 */
export function projectFrozenSetV1FreezeFromSelection(input: {
  selection: FrozenSetV1SelectionResult;
  questions?: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[];
  goldRows?: readonly NovelHoldoutFrozenSetV1GoldRow[];
  freezeRevision?: NovelHoldoutFrozenSetV1FreezeRevision;
}): FrozenSetV1FreezeProjection {
  const questions = input.questions ?? NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS;
  const goldRows = input.goldRows ?? NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD;
  const freezeRevision =
    input.freezeRevision ?? NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION;

  const selectedSlotIds = [...input.selection.selectedSlotIds];
  const joinErrors: FrozenSetV1FreezeJoinError[] = [];

  const uniqueSelected = new Set(selectedSlotIds);
  if (uniqueSelected.size !== selectedSlotIds.length) {
    const seen = new Set<string>();
    for (const slotId of selectedSlotIds) {
      if (seen.has(slotId)) {
        joinErrors.push({ slotId, reason: "duplicate selectedSlotId" });
      }
      seen.add(slotId);
    }
  }

  const questionBySlot = new Map<string, NovelHoldoutFrozenSetV1AuthoredQuestion[]>();
  for (const q of questions) {
    const bag = questionBySlot.get(q.slotId) ?? [];
    bag.push(q);
    questionBySlot.set(q.slotId, bag);
  }

  const goldBySlot = new Map<string, NovelHoldoutFrozenSetV1GoldRow[]>();
  for (const g of goldRows) {
    const bag = goldBySlot.get(g.slotId) ?? [];
    bag.push(g);
    goldBySlot.set(g.slotId, bag);
  }

  const projectedQuestions: NovelHoldoutFrozenSetV1AuthoredQuestion[] = [];
  const projectedGold: NovelHoldoutFrozenSetV1GoldRow[] = [];
  const acceptedRows: NovelHoldoutRow[] = [];

  for (const slotId of selectedSlotIds) {
    const qMatches = questionBySlot.get(slotId) ?? [];
    const gMatches = goldBySlot.get(slotId) ?? [];

    if (qMatches.length !== 1) {
      joinErrors.push({
        slotId,
        reason:
          qMatches.length === 0
            ? "missing Question for selectedSlotId"
            : `duplicate Question count=${qMatches.length}`,
      });
      continue;
    }
    if (gMatches.length !== 1) {
      joinErrors.push({
        slotId,
        reason:
          gMatches.length === 0
            ? "missing Gold for selectedSlotId"
            : `duplicate Gold count=${gMatches.length}`,
      });
      continue;
    }

    const question = qMatches[0]!;
    const goldRow = gMatches[0]!;

    if (question.slotId !== goldRow.slotId) {
      joinErrors.push({
        slotId,
        reason: "Question/Gold slotId mismatch",
      });
      continue;
    }
    if (question.question !== goldRow.question) {
      joinErrors.push({
        slotId,
        reason: "Question text mismatch vs Gold",
      });
      continue;
    }

    projectedQuestions.push(question);
    projectedGold.push(goldRow);
    acceptedRows.push(toFrozenSetV1FrozenNovelHoldoutRow(goldRow, freezeRevision));
  }

  const records: NovelHoldoutFreezeCandidateRecord[] = acceptedRows.map(
    (row) => ({ row, kind: "accepted" as const }),
  );

  return {
    selectedSlotIds,
    selectedCount: input.selection.selectedCount,
    questions: projectedQuestions,
    goldRows: projectedGold,
    acceptedRows,
    records,
    joinErrors,
  };
}

/**
 * P2 hard minimum + Selection handoff preconditions for sealed freeze.
 */
export function evaluateFrozenSetV1FreezeHardMinimum(
  selection: FrozenSetV1SelectionResult,
): {
  ok: boolean;
  reasons: readonly string[];
} {
  const reasons: string[] = [];

  if (selection.selectedSlotIds.length === 0) {
    reasons.push("selectedSlotIds is empty");
  }
  if (selection.selectedCount < NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_HARD_MIN) {
    reasons.push(
      `selectedCount=${selection.selectedCount} < hardMin=${NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_HARD_MIN}`,
    );
  }
  if (selection.gateReady !== true) {
    reasons.push(`gateReady=${selection.gateReady}`);
  }
  if (selection.readerExecuted !== false) {
    reasons.push("readerExecuted must be false");
  }
  if (selection.gatesReRun !== false) {
    reasons.push("gatesReRun must be false");
  }

  return { ok: reasons.length === 0, reasons };
}

export function buildFrozenSetV1FrozenSetManifest(
  records: readonly NovelHoldoutFreezeCandidateRecord[],
  freezeRevision: NovelHoldoutFrozenSetV1FreezeRevision =
    NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
): NovelHoldoutFrozenSetManifest {
  return buildNovelHoldoutFrozenSetManifest({
    frozenRevision: freezeRevision,
    records,
  });
}

/**
 * Build sealed FSV1 freeze snapshot from live Selection + Question + Gold.
 * Returns sealed=false (empty accepted set) when hard minimum fails or join errors exist.
 */
export function buildFrozenSetV1FreezeSnapshot(input?: {
  selection?: FrozenSetV1SelectionResult;
  questions?: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[];
  goldRows?: readonly NovelHoldoutFrozenSetV1GoldRow[];
}): FrozenSetV1FreezeSnapshot {
  const selection =
    input?.selection
    ?? selectNovelHoldoutFrozenSetV1({
      gate: snapshotGateForSelection(verifyNovelHoldoutFrozenSetV1Gates()),
      join: {
        questions: input?.questions ?? NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
        goldRows: input?.goldRows ?? NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
      },
    });

  const freezeRevision = NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION;
  const hard = evaluateFrozenSetV1FreezeHardMinimum(selection);
  const projection = projectFrozenSetV1FreezeFromSelection({
    selection,
    questions: input?.questions,
    goldRows: input?.goldRows,
    freezeRevision,
  });

  const joinOk =
    projection.joinErrors.length === 0
    && projection.acceptedRows.length === selection.selectedCount
    && projection.questions.length === selection.selectedCount
    && projection.goldRows.length === selection.selectedCount;

  const sealed = hard.ok && joinOk;

  const records = sealed ? projection.records : [];
  const acceptedRows = sealed ? projection.acceptedRows : [];
  const frozenSetManifest = buildFrozenSetV1FrozenSetManifest(
    records,
    freezeRevision,
  );

  // Keep selected ids deterministic sorted for snapshot consumers.
  const selectedSlotIds = [...selection.selectedSlotIds].sort(compareSlotId);

  return {
    freezeRevision,
    stage: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_STAGE,
    sealed,
    questionSource: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_QUESTION_SOURCE,
    goldSource: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_GOLD_SOURCE,
    selectedSlotIds,
    selectedCount: selection.selectedCount,
    selectionRevision: selection.selectionRevision,
    selectionFingerprint: selection.selectionFingerprint,
    gateReady: selection.gateReady,
    gatesReRun: false,
    goldRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION,
    goldStage: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE,
    questionCount: sealed ? projection.questions.length : 0,
    goldCount: sealed ? projection.goldRows.length : 0,
    acceptedRows,
    records,
    frozenSetManifest,
    joinErrors: [
      ...hard.reasons.map((reason) => ({
        slotId: "*",
        reason,
      })),
      ...projection.joinErrors,
    ],
    readerExecuted: false,
    readerActualAttached: false,
  };
}

/**
 * Live sealed freeze snapshot bound to current Selection / Question / Gold.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_SNAPSHOT:
  FrozenSetV1FreezeSnapshot = buildFrozenSetV1FreezeSnapshot();

/** Provenance constants kept for revision-independence checks. */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_PROVENANCE = {
  freezeRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_FREEZE_REVISION,
  selectionRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_SELECTION_REVISION,
  goldRevision: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION,
  placeholderRevision: "frozen-set-v1-unsealed-p11-3",
} as const;
