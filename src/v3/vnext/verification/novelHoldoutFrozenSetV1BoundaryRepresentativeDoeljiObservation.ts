/**
 * FSV1 Boundary Representative — D-only DOELJI observational contract.
 *
 * Purpose:
 * - Record BR-SF-DOELJI-01 vocabulary/authoring gap (surface `될지`
 *   not matched as permission keyword → Reader generalJudgement fallback)
 *   without treating it as production CONTRACT_CONFLICT.
 *
 * Isolation (import direction):
 * - This module may import Boundary Representative Gold / Blind Gold protocol.
 * - Official FSV1 160 pipeline MUST NOT import this module.
 * - Does NOT reuse B PERMHEAD CONTRACT_CONFLICT observation.
 *
 * Forbidden:
 * - NovelHoldoutFailureLabel / ORACLE_CONFLICT / CONTRACT_CONFLICT mutation
 * - FSV1 Gold / Questions / Freeze / Selection / Reader / intentRules edits
 * - Adding `될지` to permission keywords
 * - Treating observationalStatus as official exact-match success
 */

import {
  compareBlindGoldToReaderActual,
  type NovelHoldoutGoldVsActualCompare,
  type NovelHoldoutReaderActualSnapshot,
} from "./novelHoldoutBlindGoldProtocol.js";
import {
  NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
  type Fsv1BoundaryRepresentativeGoldRow,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeGold.js";

export const FSV1_BOUNDARY_DOELJI_OBSERVATION_STEP =
  "FSV1-BOUNDARY-REPRESENTATIVE-DOELJI-OBSERVATION" as const;

export const FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_SLOT_ID =
  "BR-SF-DOELJI-01" as const;

export const FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID =
  "BR-SF-DOELKKA-01" as const;

/**
 * D Boundary-only observational status axis.
 * Not a NovelHoldoutFailureLabel. Not B CONTRACT_CONFLICT.
 *
 * VOCABULARY_AUTHORING_GAP chosen over VOCABULARY_GAP to avoid colliding
 * with official FailureLabel VOCABULARY_GAP (authored E-tier taxonomy),
 * and over AUTHORING_GAP alone to keep the `될지` vocabulary surface explicit.
 */
export type Fsv1BoundaryDoeljiObservationalStatus =
  | "EXACT_MATCH"
  | "SEMANTIC_MATCH"
  | "VOCABULARY_AUTHORING_GAP"
  | "DESIGN_LIMIT"
  | "UNRESOLVED";

/**
 * Minimal evidence for DOELJI vocabulary/authoring gap narration.
 * Lives outside NovelHoldoutReaderActualSnapshot on purpose.
 */
export type Fsv1BoundaryDoeljiObservationEvidence = {
  surfaceDoelji: boolean;
  permissionKeywordMatched: boolean;
  usedFallbackIntent: boolean;
  phase1Intent: string;
  j431: boolean;
  j48: boolean;
  /** Model B projection for DOELJI (GJ → evaluation). */
  modelBIntent: string;
  /** Model B projection for DOELKKA pair anchor. */
  pairModelBIntent: string;
  pairSlotId: typeof FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID;
};

export type Fsv1BoundaryDoeljiObservationInput = {
  goldRow: Fsv1BoundaryRepresentativeGoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  evidence: Fsv1BoundaryDoeljiObservationEvidence;
};

export type Fsv1BoundaryDoeljiObservationRow = {
  slotId: string;
  goldRow: Fsv1BoundaryRepresentativeGoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  /**
   * Official Blind Gold compare. For DOELJI vocabulary/authoring gap,
   * match remains false (possibility vs generalJudgement).
   */
  compare: NovelHoldoutGoldVsActualCompare;
  observationalStatus: Fsv1BoundaryDoeljiObservationalStatus;
  evidence: Fsv1BoundaryDoeljiObservationEvidence;
  note: string;
};

/**
 * DOELKKA pair anchor — confirmation only, never a D failure row.
 * Official FSV1 pipeline is not wired; compare is local observation.
 */
export type Fsv1BoundaryDoelkkaPairAnchor = {
  slotId: typeof FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID;
  goldIntent: "possibility";
  readerIntent: "possibility";
  modelBIntent: "permission";
  permissionOrFeasibility: true;
  matchedKeyword: "해도 될까";
  compare: NovelHoldoutGoldVsActualCompare;
  note: string;
};

export type Fsv1BoundaryDoeljiObservationVerificationResult = {
  step: typeof FSV1_BOUNDARY_DOELJI_OBSERVATION_STEP;
  passed: boolean;
  row: Fsv1BoundaryDoeljiObservationRow;
  pairAnchor: Fsv1BoundaryDoelkkaPairAnchor;
  checks: Readonly<Record<string, boolean>>;
  violations: readonly string[];
};

/**
 * Sealed raw-layer Reader actual for DOELJI vocabulary/authoring gap.
 * Permission keywords miss `될지` → generalJudgement fallback (not Gold).
 */
export const FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_ACTUAL:
  NovelHoldoutReaderActualSnapshot = {
    topic: "money",
    intent: "generalJudgement",
    decisionTarget: "invest",
    analysisMode: "decision",
    provenance: "reader_runtime_observation",
  };

/**
 * Sealed Boundary-only evidence for DOELJI vocabulary/authoring gap.
 */
export const FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_EVIDENCE:
  Fsv1BoundaryDoeljiObservationEvidence = {
    surfaceDoelji: true,
    permissionKeywordMatched: false,
    usedFallbackIntent: true,
    phase1Intent: "generalJudgement",
    j431: false,
    j48: false,
    modelBIntent: "evaluation",
    pairModelBIntent: "permission",
    pairSlotId: FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID,
  };

/**
 * Sealed Reader actual for DOELKKA pair anchor (possibility match).
 */
export const FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_ACTUAL:
  NovelHoldoutReaderActualSnapshot = {
    topic: "money",
    intent: "possibility",
    decisionTarget: "invest",
    analysisMode: "decision",
    provenance: "reader_runtime_observation",
  };

const DOELJI_VOCABULARY_AUTHORING_GAP_NOTE =
  "Surface `될지` is not matched as a permission keyword under current "
  + "Reader vocabulary; Reader enters generalJudgement fallback. "
  + "Gold remains possibility + invest. This is a Boundary-only "
  + "VOCABULARY_AUTHORING_GAP observation — not production "
  + "CONTRACT_CONFLICT, not ORACLE_CONFLICT, not FailureLabel VOCABULARY_GAP.";

const DOELKKA_PAIR_ANCHOR_NOTE =
  "Minimal-pair anchor vs DOELJI: surface `해도 될까` matches permission "
  + "keyword; Reader stays possibility; Model B projects permission. "
  + "Not a D failure row; not wired into official FSV1 160 pipeline.";

function isDoeljiVocabularyAuthoringGapPattern(
  input: Fsv1BoundaryDoeljiObservationInput,
  compare: NovelHoldoutGoldVsActualCompare,
): boolean {
  const { goldRow, actual, evidence } = input;
  return (
    goldRow.slotId === FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_SLOT_ID
    && compare.match === false
    && goldRow.gold.expectedTopic === "money"
    && goldRow.gold.expectedIntent === "possibility"
    && goldRow.gold.expectedDecisionTarget === "invest"
    && actual.topic === "money"
    && actual.intent === "generalJudgement"
    && actual.decisionTarget === "invest"
    && actual.provenance === "reader_runtime_observation"
    && evidence.surfaceDoelji === true
    && evidence.permissionKeywordMatched === false
    && evidence.usedFallbackIntent === true
    && evidence.phase1Intent === "generalJudgement"
    && evidence.j431 === false
    && evidence.j48 === false
    && evidence.pairSlotId === FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID
  );
}

/**
 * Boundary-only observational compare for DOELJI.
 * Reuses official compareBlindGoldToReaderActual (match stays false).
 * Emits VOCABULARY_AUTHORING_GAP only for the sealed DOELJI pattern.
 */
export function observeFsv1BoundaryDoeljiVocabularyAuthoringGap(
  input: Fsv1BoundaryDoeljiObservationInput,
): Fsv1BoundaryDoeljiObservationRow {
  const compare = compareBlindGoldToReaderActual(
    input.goldRow.gold,
    input.actual,
  );

  const observationalStatus: Fsv1BoundaryDoeljiObservationalStatus =
    isDoeljiVocabularyAuthoringGapPattern(input, compare)
      ? "VOCABULARY_AUTHORING_GAP"
      : "UNRESOLVED";

  return {
    slotId: input.goldRow.slotId,
    goldRow: input.goldRow,
    actual: input.actual,
    compare,
    observationalStatus,
    evidence: input.evidence,
    note:
      observationalStatus === "VOCABULARY_AUTHORING_GAP"
        ? DOELJI_VOCABULARY_AUTHORING_GAP_NOTE
        : "Boundary observational status unresolved for this input.",
  };
}

/**
 * Observe the sealed BR-SF-DOELJI-01 vocabulary/authoring gap cell only.
 */
export function observeFsv1BoundaryDoeljiSealedVocabularyAuthoringGap(
  goldRows: readonly Fsv1BoundaryRepresentativeGoldRow[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
): Fsv1BoundaryDoeljiObservationRow {
  const goldRow = goldRows.find(
    (row) =>
      row.slotId === FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_SLOT_ID,
  );
  if (!goldRow) {
    throw new Error(
      `Missing Boundary Representative Gold for ${FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_SLOT_ID}`,
    );
  }

  return observeFsv1BoundaryDoeljiVocabularyAuthoringGap({
    goldRow,
    actual: FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_ACTUAL,
    evidence: FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_EVIDENCE,
  });
}

/**
 * Build DOELKKA pair anchor (no failure status).
 */
export function observeFsv1BoundaryDoelkkaPairAnchor(
  goldRows: readonly Fsv1BoundaryRepresentativeGoldRow[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
): Fsv1BoundaryDoelkkaPairAnchor {
  const goldRow = goldRows.find(
    (row) => row.slotId === FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID,
  );
  if (!goldRow) {
    throw new Error(
      `Missing Boundary Representative Gold for ${FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID}`,
    );
  }

  const compare = compareBlindGoldToReaderActual(
    goldRow.gold,
    FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_ACTUAL,
  );

  return {
    slotId: FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID,
    goldIntent: "possibility",
    readerIntent: "possibility",
    modelBIntent: "permission",
    permissionOrFeasibility: true,
    matchedKeyword: "해도 될까",
    compare,
    note: DOELKKA_PAIR_ANCHOR_NOTE,
  };
}

/**
 * Verification harness for sealed DOELJI D-only observation + DOELKKA pair.
 * Does not feed FSV1 160 counts / FailureLabel / Freeze / B observation.
 */
export function verifyFsv1BoundaryDoeljiVocabularyAuthoringGapObservation(
  goldRows: readonly Fsv1BoundaryRepresentativeGoldRow[] =
    NOVEL_HOLDOUT_FSV1_BOUNDARY_REPRESENTATIVE_GOLD,
): Fsv1BoundaryDoeljiObservationVerificationResult {
  const row = observeFsv1BoundaryDoeljiSealedVocabularyAuthoringGap(goldRows);
  const pairAnchor = observeFsv1BoundaryDoelkkaPairAnchor(goldRows);
  const violations: string[] = [];

  const checks = {
    slotIdIsDoelji:
      row.slotId === FSV1_BOUNDARY_DOELJI_VOCABULARY_AUTHORING_GAP_SLOT_ID,
    officialCompareMatchIsFalse: row.compare.match === false,
    observationalStatusIsVocabularyAuthoringGap:
      row.observationalStatus === "VOCABULARY_AUTHORING_GAP",
    surfaceDoeljiTrue: row.evidence.surfaceDoelji === true,
    permissionKeywordMatchedFalse:
      row.evidence.permissionKeywordMatched === false,
    usedFallbackIntentTrue: row.evidence.usedFallbackIntent === true,
    phase1IntentGeneralJudgement:
      row.evidence.phase1Intent === "generalJudgement",
    j431False: row.evidence.j431 === false,
    j48False: row.evidence.j48 === false,
    goldIntentPossibility: row.goldRow.gold.expectedIntent === "possibility",
    goldDecisionTargetInvest:
      row.goldRow.gold.expectedDecisionTarget === "invest",
    actualIntentGeneralJudgement: row.actual.intent === "generalJudgement",
    actualDecisionTargetInvest: row.actual.decisionTarget === "invest",
    noOfficialFailureLabelAttached:
      row.compare.failureClassification === null,
    notContractConflictStatus:
      row.observationalStatus !== ("CONTRACT_CONFLICT" as string),
    pairAnchorSlotIdIsDoelkka:
      pairAnchor.slotId === FSV1_BOUNDARY_DOELKKA_PAIR_ANCHOR_SLOT_ID,
    pairGoldIntentPossibility: pairAnchor.goldIntent === "possibility",
    pairReaderIntentPossibility: pairAnchor.readerIntent === "possibility",
    pairModelBIntentPermission: pairAnchor.modelBIntent === "permission",
    pairPermissionOrFeasibilityTrue:
      pairAnchor.permissionOrFeasibility === true,
    pairMatchedKeywordDoelkka: pairAnchor.matchedKeyword === "해도 될까",
    pairOfficialCompareMatchIsTrue: pairAnchor.compare.match === true,
    pairGoldDecisionTargetInvest:
      pairAnchor.compare.gold.expectedDecisionTarget === "invest",
  } as const;

  for (const [key, ok] of Object.entries(checks)) {
    if (!ok) violations.push(key);
  }

  return {
    step: FSV1_BOUNDARY_DOELJI_OBSERVATION_STEP,
    passed: violations.length === 0,
    row,
    pairAnchor,
    checks,
    violations,
  };
}

export function serializeFsv1BoundaryDoeljiObservationVerificationResult(
  result: Fsv1BoundaryDoeljiObservationVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      violations: result.violations,
      checks: result.checks,
      row: {
        slotId: result.row.slotId,
        observationalStatus: result.row.observationalStatus,
        compareMatch: result.row.compare.match,
        primaryAxisMatch: result.row.compare.primaryAxisMatch,
        failureClassification: result.row.compare.failureClassification,
        gold: {
          expectedTopic: result.row.goldRow.gold.expectedTopic,
          expectedIntent: result.row.goldRow.gold.expectedIntent,
          expectedDecisionTarget:
            result.row.goldRow.gold.expectedDecisionTarget,
          boundaryAgainst: result.row.goldRow.gold.boundaryAgainst,
          matchPolicy: result.row.goldRow.gold.matchPolicy,
        },
        actual: result.row.actual,
        evidence: result.row.evidence,
        note: result.row.note,
      },
      pairAnchor: {
        slotId: result.pairAnchor.slotId,
        goldIntent: result.pairAnchor.goldIntent,
        readerIntent: result.pairAnchor.readerIntent,
        modelBIntent: result.pairAnchor.modelBIntent,
        permissionOrFeasibility: result.pairAnchor.permissionOrFeasibility,
        matchedKeyword: result.pairAnchor.matchedKeyword,
        compareMatch: result.pairAnchor.compare.match,
        note: result.pairAnchor.note,
      },
    },
    null,
    2,
  );
}
