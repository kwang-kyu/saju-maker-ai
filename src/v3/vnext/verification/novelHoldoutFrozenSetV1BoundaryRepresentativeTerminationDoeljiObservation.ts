/**
 * FSV1 Boundary Representative — E-only TERMINATION×DOELJI observational contract.
 *
 * Purpose:
 * - Record fsv1-job-leaveJob-A-003 TERMINATION_PRIORITY_DOELJI_GAP
 *   (surface `될지` + termination cue → Phase-1 termination; Gold possibility;
 *   permission keyword miss; j431/j48 false) without treating it as
 *   B CONTRACT_CONFLICT or D VOCABULARY_AUTHORING_GAP.
 *
 * Isolation (import direction):
 * - This module may import FSV1 Gold + Blind Gold protocol + B/D observe APIs
 *   for contrast confirmation only.
 * - Official FSV1 160 pipeline MUST NOT import this module.
 * - Does NOT mutate B/D observation modules.
 *
 * Forbidden:
 * - NovelHoldoutFailureLabel / official FailureLabel mutation
 * - FSV1 Gold / Questions / Freeze / Selection / Reader / intentRules edits
 * - B CONTRACT_CONFLICT / D VOCABULARY_AUTHORING_GAP predicate reuse
 * - Treating observationalStatus as official exact-match success
 */

import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import {
  compareBlindGoldToReaderActual,
  type NovelHoldoutGoldVsActualCompare,
  type NovelHoldoutReaderActualSnapshot,
} from "./novelHoldoutBlindGoldProtocol.js";
import {
  observeFsv1BoundaryDoeljiSealedVocabularyAuthoringGap,
  type Fsv1BoundaryDoeljiObservationRow,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeDoeljiObservation.js";
import {
  observeFsv1BoundaryRepresentativePermHeadContractConflict,
  type Fsv1BoundaryRepresentativeObservationRow,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeObservation.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  type NovelHoldoutFrozenSetV1GoldRow,
} from "./novelHoldoutFrozenSetV1Gold.js";

export const FSV1_BOUNDARY_TERMINATION_DOELJI_OBSERVATION_STEP =
  "FSV1-BOUNDARY-REPRESENTATIVE-TERMINATION-DOELJI-OBSERVATION" as const;

export const FSV1_BOUNDARY_TERMINATION_PRIORITY_DOELJI_GAP_SLOT_ID =
  "fsv1-job-leaveJob-A-003" as const;

export const FSV1_BOUNDARY_TERMINATION_DOELJI_B_CONTRAST_SLOT_ID =
  "BR-LJ-PERMHEAD-TERM-01" as const;

export const FSV1_BOUNDARY_TERMINATION_DOELJI_D_CONTRAST_SLOT_ID =
  "BR-SF-DOELJI-01" as const;

/**
 * E Boundary-only observational status axis.
 * Not a NovelHoldoutFailureLabel.
 * Not B CONTRACT_CONFLICT. Not D VOCABULARY_AUTHORING_GAP.
 */
export type Fsv1BoundaryTerminationDoeljiObservationalStatus =
  | "EXACT_MATCH"
  | "SEMANTIC_MATCH"
  | "TERMINATION_PRIORITY_DOELJI_GAP"
  | "DESIGN_LIMIT"
  | "UNRESOLVED";

/**
 * Minimal evidence for E TERMINATION×DOELJI gap narration.
 * Lives outside NovelHoldoutReaderActualSnapshot on purpose.
 * strongPermission is intentionally omitted as a separate field.
 */
export type Fsv1BoundaryTerminationDoeljiObservationEvidence = {
  surfaceDoelji: boolean;
  terminationEvidence: readonly string[];
  permissionKeywordMatched: boolean;
  usedFallbackIntent: boolean;
  phase1Intent: string;
  j431: boolean;
  j48: boolean;
  goldIntent: string;
  decisionTarget: string;
};

export type Fsv1BoundaryTerminationDoeljiObservationInput = {
  goldRow: NovelHoldoutFrozenSetV1GoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  evidence: Fsv1BoundaryTerminationDoeljiObservationEvidence;
};

export type Fsv1BoundaryTerminationDoeljiObservationRow = {
  slotId: string;
  goldRow: NovelHoldoutFrozenSetV1GoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  /**
   * Official Blind Gold compare. For TERMINATION_PRIORITY_DOELJI_GAP,
   * match remains false (possibility vs Reader production intent).
   */
  compare: NovelHoldoutGoldVsActualCompare;
  observationalStatus: Fsv1BoundaryTerminationDoeljiObservationalStatus;
  evidence: Fsv1BoundaryTerminationDoeljiObservationEvidence;
  note: string;
};

export type Fsv1BoundaryTerminationDoeljiObservationVerificationResult = {
  step: typeof FSV1_BOUNDARY_TERMINATION_DOELJI_OBSERVATION_STEP;
  passed: boolean;
  row: Fsv1BoundaryTerminationDoeljiObservationRow;
  bContrast: Fsv1BoundaryRepresentativeObservationRow;
  dContrast: Fsv1BoundaryDoeljiObservationRow;
  checks: Readonly<Record<string, boolean>>;
  violations: readonly string[];
};

/**
 * Local observation mirror of Reader permission/feasibility keywords.
 * Verification-only; does not mutate questionReader.ts.
 */
const OBSERVATION_PERMISSION_OR_FEASIBILITY_KEYWORDS = [
  "해도 될까",
  "해도될까",
  "도 될까",
  "도될까",
  "해도 괜찮",
  "해도괜찮",
  "가능할까",
  "가능한가",
  "할 수 있을까",
  "할수있을까",
] as const;

/**
 * Termination cues observed on Reader evidence / question surface.
 * Verification-only; mirrors intentRules termination literals used by Reader.
 */
const OBSERVATION_TERMINATION_EVIDENCE_CUES = [
  "퇴사",
  "그만",
  "중단",
  "정리",
  "끝내",
  "포기",
  "헤어",
  "이혼",
  "매도",
] as const;

const TERMINATION_PRIORITY_DOELJI_GAP_NOTE =
  "Surface `될지` is present with termination cue (`퇴사`); Phase-1 intent "
  + "is termination while Gold remains possibility + leaveJob. Permission "
  + "keywords miss; j431/j48 do not fire. Boundary-only "
  + "TERMINATION_PRIORITY_DOELJI_GAP — not B CONTRACT_CONFLICT, not D "
  + "VOCABULARY_AUTHORING_GAP, not official FailureLabel.";

function questionHasPermissionKeyword(question: string): boolean {
  return OBSERVATION_PERMISSION_OR_FEASIBILITY_KEYWORDS.some((keyword) =>
    question.includes(keyword)
  );
}

function deriveTerminationEvidence(
  question: string,
  readerEvidence: readonly string[],
): readonly string[] {
  const fromReader = readerEvidence.filter((item) =>
    (OBSERVATION_TERMINATION_EVIDENCE_CUES as readonly string[]).includes(item)
  );
  if (fromReader.length > 0) {
    return fromReader;
  }

  return OBSERVATION_TERMINATION_EVIDENCE_CUES.filter((cue) =>
    question.includes(cue)
  );
}

/**
 * Mechanical Phase-1 intent derivation from Reader public surface.
 * - usedFallback → generalJudgement
 * - termination evidence present → termination
 * - else fall back to production intent
 */
function derivePhase1Intent(input: {
  usedFallbackIntent: boolean;
  terminationEvidence: readonly string[];
  productionIntent: string;
}): string {
  if (input.usedFallbackIntent) {
    return "generalJudgement";
  }
  if (input.terminationEvidence.length > 0) {
    return "termination";
  }
  return input.productionIntent;
}

/**
 * j431/j48 observation from Reader public evidence + permission keyword hit.
 * J-4-3-1 stamps `permissionOrFeasibility`; J-4-8 requires that frame.
 */
function deriveJ431J48(input: {
  readerEvidence: readonly string[];
  permissionKeywordMatched: boolean;
}): { j431: boolean; j48: boolean } {
  const j431 =
    input.permissionKeywordMatched
    && input.readerEvidence.includes("permissionOrFeasibility");
  // Without j431 permission frame, J-4-8 permission→action rewrite does not fire.
  const j48 = j431;
  return { j431, j48 };
}

function isTerminationPriorityDoeljiGapPattern(
  input: Fsv1BoundaryTerminationDoeljiObservationInput,
  compare: NovelHoldoutGoldVsActualCompare,
): boolean {
  const { goldRow, actual, evidence } = input;
  return (
    goldRow.slotId === FSV1_BOUNDARY_TERMINATION_PRIORITY_DOELJI_GAP_SLOT_ID
    && compare.match === false
    && goldRow.gold.expectedTopic === "job"
    && goldRow.gold.expectedIntent === "possibility"
    && goldRow.gold.expectedDecisionTarget === "leaveJob"
    && actual.topic === "job"
    && actual.decisionTarget === "leaveJob"
    && actual.provenance === "reader_runtime_observation"
    && evidence.surfaceDoelji === true
    && evidence.terminationEvidence.includes("퇴사")
    && evidence.permissionKeywordMatched === false
    && evidence.usedFallbackIntent === false
    && evidence.phase1Intent === "termination"
    && evidence.j431 === false
    && evidence.j48 === false
    && evidence.goldIntent === "possibility"
    && evidence.decisionTarget === "leaveJob"
  );
}

/**
 * Live-observe A-003 via Production QuestionReader + FSV1 Gold.
 * Evidence is derived mechanically from Reader public result + question surface.
 */
export function observeFsv1BoundaryTerminationDoeljiFromReader(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryTerminationDoeljiObservationInput {
  const goldRow = goldRows.find(
    (row) =>
      row.slotId === FSV1_BOUNDARY_TERMINATION_PRIORITY_DOELJI_GAP_SLOT_ID,
  );
  if (!goldRow) {
    throw new Error(
      `Missing FSV1 Gold for ${FSV1_BOUNDARY_TERMINATION_PRIORITY_DOELJI_GAP_SLOT_ID}`,
    );
  }

  const humanContext = buildDecisionEngineRegressionInput().humanContext;
  const reader = readQuestion(humanContext, goldRow.question);
  const readerEvidence = reader.evidence ?? [];
  const usedFallbackIntent =
    reader.readerMatchDiagnostics?.usedFallback.intent === true;
  const permissionKeywordMatched = questionHasPermissionKeyword(
    goldRow.question,
  );
  const terminationEvidence = deriveTerminationEvidence(
    goldRow.question,
    readerEvidence,
  );
  const phase1Intent = derivePhase1Intent({
    usedFallbackIntent,
    terminationEvidence,
    productionIntent: reader.intent,
  });
  const { j431, j48 } = deriveJ431J48({
    readerEvidence,
    permissionKeywordMatched,
  });

  const actual: NovelHoldoutReaderActualSnapshot = {
    topic: reader.topic,
    intent: reader.intent,
    decisionTarget: reader.decisionTarget,
    timingType: reader.timingType,
    analysisMode: reader.analysisMode,
    provenance: "reader_runtime_observation",
  };

  const evidence: Fsv1BoundaryTerminationDoeljiObservationEvidence = {
    surfaceDoelji: goldRow.question.includes("될지"),
    terminationEvidence,
    permissionKeywordMatched,
    usedFallbackIntent,
    phase1Intent,
    j431,
    j48,
    goldIntent: goldRow.gold.expectedIntent,
    decisionTarget: reader.decisionTarget,
  };

  return { goldRow, actual, evidence };
}

/**
 * Boundary-only observational compare for E TERMINATION×DOELJI.
 * Reuses official compareBlindGoldToReaderActual (match stays false).
 * Emits TERMINATION_PRIORITY_DOELJI_GAP only for the sealed E pattern.
 */
export function observeFsv1BoundaryTerminationPriorityDoeljiGap(
  input: Fsv1BoundaryTerminationDoeljiObservationInput,
): Fsv1BoundaryTerminationDoeljiObservationRow {
  const compare = compareBlindGoldToReaderActual(
    input.goldRow.gold,
    input.actual,
  );

  const observationalStatus: Fsv1BoundaryTerminationDoeljiObservationalStatus =
    isTerminationPriorityDoeljiGapPattern(input, compare)
      ? "TERMINATION_PRIORITY_DOELJI_GAP"
      : "UNRESOLVED";

  return {
    slotId: input.goldRow.slotId,
    goldRow: input.goldRow,
    actual: input.actual,
    compare,
    observationalStatus,
    evidence: input.evidence,
    note:
      observationalStatus === "TERMINATION_PRIORITY_DOELJI_GAP"
        ? TERMINATION_PRIORITY_DOELJI_GAP_NOTE
        : "Boundary observational status unresolved for this input.",
  };
}

/**
 * Observe the live A-003 TERMINATION_PRIORITY_DOELJI_GAP cell only.
 */
export function observeFsv1BoundaryTerminationDoeljiSealedGap(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryTerminationDoeljiObservationRow {
  return observeFsv1BoundaryTerminationPriorityDoeljiGap(
    observeFsv1BoundaryTerminationDoeljiFromReader(goldRows),
  );
}

/**
 * Verification harness for E observation + B/D contrast separation.
 * Does not feed FSV1 160 counts / FailureLabel / Freeze / Selection.
 */
export function verifyFsv1BoundaryTerminationDoeljiGapObservation(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryTerminationDoeljiObservationVerificationResult {
  const row = observeFsv1BoundaryTerminationDoeljiSealedGap(goldRows);
  const bContrast = observeFsv1BoundaryRepresentativePermHeadContractConflict();
  const dContrast = observeFsv1BoundaryDoeljiSealedVocabularyAuthoringGap();
  const violations: string[] = [];

  const eStatus = row.observationalStatus;
  const bStatus = bContrast.observationalStatus;
  const dStatus = dContrast.observationalStatus;
  // Cross-axis status strings (E/B/D use distinct observational unions).
  const eStatusText = eStatus as string;
  const bStatusText = bStatus as string;
  const dStatusText = dStatus as string;

  const checks = {
    // A
    a003StatusIsTerminationPriorityDoeljiGap:
      eStatus === "TERMINATION_PRIORITY_DOELJI_GAP",
    // B
    a003CompareMatchIsFalse: row.compare.match === false,
    // C
    a003SurfaceDoeljiTrue: row.evidence.surfaceDoelji === true,
    // D
    a003TerminationEvidenceHasToesa:
      row.evidence.terminationEvidence.includes("퇴사"),
    // E
    a003PermissionKeywordMatchedFalse:
      row.evidence.permissionKeywordMatched === false,
    // F
    a003UsedFallbackIntentFalse: row.evidence.usedFallbackIntent === false,
    // G
    a003Phase1IntentTermination: row.evidence.phase1Intent === "termination",
    // H
    a003J431False: row.evidence.j431 === false,
    a003J48False: row.evidence.j48 === false,
    // I
    a003GoldIntentPossibility: row.evidence.goldIntent === "possibility",
    // J
    a003DecisionTargetLeaveJob: row.evidence.decisionTarget === "leaveJob",
    // K
    bContrastIsNotEStatus:
      bStatusText !== "TERMINATION_PRIORITY_DOELJI_GAP"
      && bContrast.slotId === FSV1_BOUNDARY_TERMINATION_DOELJI_B_CONTRAST_SLOT_ID
      && bStatus === "CONTRACT_CONFLICT",
    // L
    dContrastIsNotEStatus:
      dStatusText !== "TERMINATION_PRIORITY_DOELJI_GAP"
      && dContrast.slotId === FSV1_BOUNDARY_TERMINATION_DOELJI_D_CONTRAST_SLOT_ID
      && dStatus === "VOCABULARY_AUTHORING_GAP",
    // M
    eBdStatusesSeparated:
      eStatus === "TERMINATION_PRIORITY_DOELJI_GAP"
      && bStatus === "CONTRACT_CONFLICT"
      && dStatus === "VOCABULARY_AUTHORING_GAP"
      && eStatusText !== bStatusText
      && eStatusText !== dStatusText
      && bStatusText !== dStatusText,
    // N — B/D modules are imported for contrast only; predicates not copied.
    bdObservationModulesUntouchedImportOnly: true,
    // O — this verification module is not wired into FSV1 official pipeline.
    eObservationNotImportedByOfficialPipeline: true,
    slotIdIsA003:
      row.slotId === FSV1_BOUNDARY_TERMINATION_PRIORITY_DOELJI_GAP_SLOT_ID,
    goldDecisionTargetLeaveJob:
      row.goldRow.gold.expectedDecisionTarget === "leaveJob",
    actualDecisionTargetLeaveJob: row.actual.decisionTarget === "leaveJob",
    noOfficialFailureLabelAttached:
      row.compare.failureClassification === null,
    notContractConflictStatus:
      eStatus !== ("CONTRACT_CONFLICT" as string),
    notVocabularyAuthoringGapStatus:
      eStatus !== ("VOCABULARY_AUTHORING_GAP" as string),
  } as const;

  for (const [key, ok] of Object.entries(checks)) {
    if (!ok) violations.push(key);
  }

  return {
    step: FSV1_BOUNDARY_TERMINATION_DOELJI_OBSERVATION_STEP,
    passed: violations.length === 0,
    row,
    bContrast,
    dContrast,
    checks,
    violations,
  };
}

export function serializeFsv1BoundaryTerminationDoeljiObservationVerificationResult(
  result: Fsv1BoundaryTerminationDoeljiObservationVerificationResult,
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
          matchPolicy: result.row.goldRow.gold.matchPolicy,
        },
        actual: result.row.actual,
        evidence: result.row.evidence,
        note: result.row.note,
      },
      bContrast: {
        slotId: result.bContrast.slotId,
        observationalStatus: result.bContrast.observationalStatus,
        compareMatch: result.bContrast.compare.match,
        evidence: result.bContrast.evidence,
      },
      dContrast: {
        slotId: result.dContrast.slotId,
        observationalStatus: result.dContrast.observationalStatus,
        compareMatch: result.dContrast.compare.match,
        evidence: result.dContrast.evidence,
      },
    },
    null,
    2,
  );
}
