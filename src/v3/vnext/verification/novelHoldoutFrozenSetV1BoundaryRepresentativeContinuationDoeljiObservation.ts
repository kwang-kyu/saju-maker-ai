/**
 * FSV1 Boundary Representative — Continuation×DOELJI observational contract.
 *
 * Purpose:
 * - Record fsv1-biz-buy-A-004 CONTINUATION_PRIORITY_DOELJI_GAP
 *   (surface `될지` + continuation cue `이어가` → Phase-1 continuation;
 *   Gold possibility + buy; permission keyword miss; j431/j48 false)
 *   without treating it as B CONTRACT_CONFLICT, D VOCABULARY_AUTHORING_GAP,
 *   or E TERMINATION_PRIORITY_DOELJI_GAP.
 * - Anchor fsv1-biz-continue-A-001: Gold continuation + Phase-1 continuation
 *   + DT continue (rawGoldEqualsRawReader) must NOT emit the gap status.
 *   Presence of `될지` alone is not a failure — goldIntent=possibility is required.
 *
 * Isolation (import direction):
 * - This module may import FSV1 Gold + Blind Gold protocol + B/D/E observe APIs
 *   for contrast confirmation only.
 * - Official FSV1 160 pipeline MUST NOT import this module.
 * - Does NOT mutate B/D/E observation modules.
 *
 * Forbidden:
 * - NovelHoldoutFailureLabel / official FailureLabel mutation
 * - FSV1 Gold / Questions / Freeze / Selection / Reader / intentRules edits
 * - B/D/E predicate reuse
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
  observeFsv1BoundaryTerminationDoeljiSealedGap,
  type Fsv1BoundaryTerminationDoeljiObservationRow,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeTerminationDoeljiObservation.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  type NovelHoldoutFrozenSetV1GoldRow,
} from "./novelHoldoutFrozenSetV1Gold.js";

export const FSV1_BOUNDARY_CONTINUATION_DOELJI_OBSERVATION_STEP =
  "FSV1-BOUNDARY-REPRESENTATIVE-CONTINUATION-DOELJI-OBSERVATION" as const;

export const FSV1_BOUNDARY_CONTINUATION_PRIORITY_DOELJI_GAP_SLOT_ID =
  "fsv1-biz-buy-A-004" as const;

export const FSV1_BOUNDARY_CONTINUATION_DOELJI_ANCHOR_SLOT_ID =
  "fsv1-biz-continue-A-001" as const;

export const FSV1_BOUNDARY_CONTINUATION_DOELJI_B_CONTRAST_SLOT_ID =
  "BR-LJ-PERMHEAD-TERM-01" as const;

export const FSV1_BOUNDARY_CONTINUATION_DOELJI_D_CONTRAST_SLOT_ID =
  "BR-SF-DOELJI-01" as const;

export const FSV1_BOUNDARY_CONTINUATION_DOELJI_E_CONTRAST_SLOT_ID =
  "fsv1-job-leaveJob-A-003" as const;

/**
 * Continuation Boundary-only observational status axis.
 * Not a NovelHoldoutFailureLabel.
 * Not B CONTRACT_CONFLICT / D VOCABULARY_AUTHORING_GAP /
 * E TERMINATION_PRIORITY_DOELJI_GAP.
 */
export type Fsv1BoundaryContinuationDoeljiObservationalStatus =
  | "EXACT_MATCH"
  | "SEMANTIC_MATCH"
  | "CONTINUATION_PRIORITY_DOELJI_GAP"
  | "DESIGN_LIMIT"
  | "UNRESOLVED";

/**
 * Minimal evidence for CONTINUATION×DOELJI gap narration.
 * Lives outside NovelHoldoutReaderActualSnapshot on purpose.
 * strongPermission is intentionally omitted as a separate field.
 */
export type Fsv1BoundaryContinuationDoeljiObservationEvidence = {
  surfaceDoelji: boolean;
  continuationEvidence: readonly string[];
  permissionKeywordMatched: boolean;
  usedFallbackIntent: boolean;
  phase1Intent: string;
  j431: boolean;
  j48: boolean;
  goldIntent: string;
  decisionTarget: string;
};

export type Fsv1BoundaryContinuationDoeljiObservationInput = {
  goldRow: NovelHoldoutFrozenSetV1GoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  evidence: Fsv1BoundaryContinuationDoeljiObservationEvidence;
};

export type Fsv1BoundaryContinuationDoeljiObservationRow = {
  slotId: string;
  goldRow: NovelHoldoutFrozenSetV1GoldRow;
  actual: NovelHoldoutReaderActualSnapshot;
  /**
   * Official Blind Gold compare. For CONTINUATION_PRIORITY_DOELJI_GAP,
   * match remains false (possibility vs Reader production intent).
   */
  compare: NovelHoldoutGoldVsActualCompare;
  observationalStatus: Fsv1BoundaryContinuationDoeljiObservationalStatus;
  evidence: Fsv1BoundaryContinuationDoeljiObservationEvidence;
  /**
   * Gold intent/DT vs Phase-1 intent/DT alignment (pre-Model-B raw axis).
   * Used by the continue anchor; not an official FailureLabel.
   */
  rawGoldEqualsRawReader: boolean;
  note: string;
};

export type Fsv1BoundaryContinuationDoeljiObservationVerificationResult = {
  step: typeof FSV1_BOUNDARY_CONTINUATION_DOELJI_OBSERVATION_STEP;
  passed: boolean;
  row: Fsv1BoundaryContinuationDoeljiObservationRow;
  anchor: Fsv1BoundaryContinuationDoeljiObservationRow;
  bContrast: Fsv1BoundaryRepresentativeObservationRow;
  dContrast: Fsv1BoundaryDoeljiObservationRow;
  eContrast: Fsv1BoundaryTerminationDoeljiObservationRow;
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
 * Continuation cues observed on Reader evidence / question surface.
 * Verification-only; mirrors intentRules continuation literals used by Reader.
 */
const OBSERVATION_CONTINUATION_EVIDENCE_CUES = [
  "계속",
  "유지",
  "버텨",
  "이어가",
  "지켜야",
] as const;

const CONTINUATION_PRIORITY_DOELJI_GAP_NOTE =
  "Surface `될지` is present with continuation cue (`이어가`); Phase-1 intent "
  + "is continuation while Gold remains possibility + buy. Permission "
  + "keywords miss; j431/j48 do not fire. Production intent may show "
  + "Model B continuation→evaluation. Boundary-only "
  + "CONTINUATION_PRIORITY_DOELJI_GAP — not B CONTRACT_CONFLICT, not D "
  + "VOCABULARY_AUTHORING_GAP, not E TERMINATION_PRIORITY_DOELJI_GAP, "
  + "not official FailureLabel.";

const CONTINUATION_DOELJI_ANCHOR_NOTE =
  "Anchor fsv1-biz-continue-A-001: Gold continuation + Phase-1 continuation "
  + "+ DecisionTarget continue (rawGoldEqualsRawReader). Surface `될지` may "
  + "exist but goldIntent is not possibility, so "
  + "CONTINUATION_PRIORITY_DOELJI_GAP must not fire.";

function questionHasPermissionKeyword(question: string): boolean {
  return OBSERVATION_PERMISSION_OR_FEASIBILITY_KEYWORDS.some((keyword) =>
    question.includes(keyword)
  );
}

function deriveContinuationEvidence(
  question: string,
  readerEvidence: readonly string[],
): readonly string[] {
  const fromReader = readerEvidence.filter((item) =>
    (OBSERVATION_CONTINUATION_EVIDENCE_CUES as readonly string[]).includes(item)
  );
  if (fromReader.length > 0) {
    return fromReader;
  }

  return OBSERVATION_CONTINUATION_EVIDENCE_CUES.filter((cue) =>
    question.includes(cue)
  );
}

/**
 * Mechanical Phase-1 intent derivation from Reader public surface.
 * - usedFallback → generalJudgement
 * - continuation evidence present → continuation
 * - else fall back to production intent
 */
function derivePhase1Intent(input: {
  usedFallbackIntent: boolean;
  continuationEvidence: readonly string[];
  productionIntent: string;
}): string {
  if (input.usedFallbackIntent) {
    return "generalJudgement";
  }
  if (input.continuationEvidence.length > 0) {
    return "continuation";
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

function computeRawGoldEqualsRawReader(input: {
  goldIntent: string;
  goldDecisionTarget: string;
  phase1Intent: string;
  decisionTarget: string;
}): boolean {
  return (
    input.goldIntent === input.phase1Intent
    && input.goldDecisionTarget === input.decisionTarget
  );
}

function isContinuationPriorityDoeljiGapPattern(
  input: Fsv1BoundaryContinuationDoeljiObservationInput,
  compare: NovelHoldoutGoldVsActualCompare,
): boolean {
  const { goldRow, evidence } = input;
  return (
    goldRow.slotId === FSV1_BOUNDARY_CONTINUATION_PRIORITY_DOELJI_GAP_SLOT_ID
    && evidence.surfaceDoelji === true
    && evidence.continuationEvidence.includes("이어가")
    && evidence.permissionKeywordMatched === false
    && evidence.phase1Intent === "continuation"
    && evidence.usedFallbackIntent === false
    && evidence.j431 === false
    && evidence.j48 === false
    && evidence.goldIntent === "possibility"
    && evidence.decisionTarget === "buy"
    && compare.match === false
  );
}

/**
 * Live-observe a FSV1 Gold slot via Production QuestionReader.
 * Evidence is derived mechanically from Reader public result + question surface.
 */
export function observeFsv1BoundaryContinuationDoeljiFromReader(
  slotId: string,
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryContinuationDoeljiObservationInput {
  const goldRow = goldRows.find((row) => row.slotId === slotId);
  if (!goldRow) {
    throw new Error(`Missing FSV1 Gold for ${slotId}`);
  }

  const humanContext = buildDecisionEngineRegressionInput().humanContext;
  const reader = readQuestion(humanContext, goldRow.question);
  const readerEvidence = reader.evidence ?? [];
  const usedFallbackIntent =
    reader.readerMatchDiagnostics?.usedFallback.intent === true;
  const permissionKeywordMatched = questionHasPermissionKeyword(
    goldRow.question,
  );
  const continuationEvidence = deriveContinuationEvidence(
    goldRow.question,
    readerEvidence,
  );
  const phase1Intent = derivePhase1Intent({
    usedFallbackIntent,
    continuationEvidence,
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

  const evidence: Fsv1BoundaryContinuationDoeljiObservationEvidence = {
    surfaceDoelji: goldRow.question.includes("될지"),
    continuationEvidence,
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
 * Boundary-only observational compare for CONTINUATION×DOELJI.
 * Reuses official compareBlindGoldToReaderActual (Primary match stays false).
 * Emits CONTINUATION_PRIORITY_DOELJI_GAP only for the sealed Primary pattern.
 */
export function observeFsv1BoundaryContinuationPriorityDoeljiGap(
  input: Fsv1BoundaryContinuationDoeljiObservationInput,
): Fsv1BoundaryContinuationDoeljiObservationRow {
  const compare = compareBlindGoldToReaderActual(
    input.goldRow.gold,
    input.actual,
  );

  const observationalStatus: Fsv1BoundaryContinuationDoeljiObservationalStatus =
    isContinuationPriorityDoeljiGapPattern(input, compare)
      ? "CONTINUATION_PRIORITY_DOELJI_GAP"
      : "UNRESOLVED";

  const rawGoldEqualsRawReader = computeRawGoldEqualsRawReader({
    goldIntent: input.goldRow.gold.expectedIntent,
    goldDecisionTarget: input.goldRow.gold.expectedDecisionTarget,
    phase1Intent: input.evidence.phase1Intent,
    decisionTarget: input.evidence.decisionTarget,
  });

  const isPrimaryGap =
    observationalStatus === "CONTINUATION_PRIORITY_DOELJI_GAP";
  const isAnchorSlot =
    input.goldRow.slotId === FSV1_BOUNDARY_CONTINUATION_DOELJI_ANCHOR_SLOT_ID;

  return {
    slotId: input.goldRow.slotId,
    goldRow: input.goldRow,
    actual: input.actual,
    compare,
    observationalStatus,
    evidence: input.evidence,
    rawGoldEqualsRawReader,
    note: isPrimaryGap
      ? CONTINUATION_PRIORITY_DOELJI_GAP_NOTE
      : isAnchorSlot
      ? CONTINUATION_DOELJI_ANCHOR_NOTE
      : "Boundary observational status unresolved for this input.",
  };
}

/**
 * Observe the live Primary CONTINUATION_PRIORITY_DOELJI_GAP cell only.
 */
export function observeFsv1BoundaryContinuationDoeljiSealedGap(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryContinuationDoeljiObservationRow {
  return observeFsv1BoundaryContinuationPriorityDoeljiGap(
    observeFsv1BoundaryContinuationDoeljiFromReader(
      FSV1_BOUNDARY_CONTINUATION_PRIORITY_DOELJI_GAP_SLOT_ID,
      goldRows,
    ),
  );
}

/**
 * Observe the continue-family anchor (gap status must not fire).
 */
export function observeFsv1BoundaryContinuationDoeljiAnchor(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryContinuationDoeljiObservationRow {
  return observeFsv1BoundaryContinuationPriorityDoeljiGap(
    observeFsv1BoundaryContinuationDoeljiFromReader(
      FSV1_BOUNDARY_CONTINUATION_DOELJI_ANCHOR_SLOT_ID,
      goldRows,
    ),
  );
}

/**
 * Verification harness for Continuation observation + B/D/E contrast separation.
 * Does not feed FSV1 160 counts / FailureLabel / Freeze / Selection.
 */
export function verifyFsv1BoundaryContinuationDoeljiGapObservation(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
): Fsv1BoundaryContinuationDoeljiObservationVerificationResult {
  const row = observeFsv1BoundaryContinuationDoeljiSealedGap(goldRows);
  const anchor = observeFsv1BoundaryContinuationDoeljiAnchor(goldRows);
  const bContrast = observeFsv1BoundaryRepresentativePermHeadContractConflict();
  const dContrast = observeFsv1BoundaryDoeljiSealedVocabularyAuthoringGap();
  const eContrast = observeFsv1BoundaryTerminationDoeljiSealedGap(goldRows);
  const violations: string[] = [];

  const continuationStatus = row.observationalStatus;
  const anchorStatus = anchor.observationalStatus;
  const bStatus = bContrast.observationalStatus;
  const dStatus = dContrast.observationalStatus;
  const eStatus = eContrast.observationalStatus;
  // Cross-axis status strings (Continuation/B/D/E use distinct observational unions).
  const continuationStatusText = continuationStatus as string;
  const bStatusText = bStatus as string;
  const dStatusText = dStatus as string;
  const eStatusText = eStatus as string;

  const checks = {
    // A
    primaryStatusIsContinuationPriorityDoeljiGap:
      continuationStatus === "CONTINUATION_PRIORITY_DOELJI_GAP",
    // B
    primaryCompareMatchIsFalse: row.compare.match === false,
    // C
    primarySurfaceDoeljiTrue: row.evidence.surfaceDoelji === true,
    // D
    primaryContinuationEvidenceHasIeoga:
      row.evidence.continuationEvidence.includes("이어가"),
    // E
    primaryPermissionKeywordMatchedFalse:
      row.evidence.permissionKeywordMatched === false,
    // F
    primaryUsedFallbackIntentFalse: row.evidence.usedFallbackIntent === false,
    // G
    primaryPhase1IntentContinuation:
      row.evidence.phase1Intent === "continuation",
    // H
    primaryJ431False: row.evidence.j431 === false,
    // I
    primaryJ48False: row.evidence.j48 === false,
    // J
    primaryGoldIntentPossibility: row.evidence.goldIntent === "possibility",
    // K
    primaryDecisionTargetBuy: row.evidence.decisionTarget === "buy",
    // L
    anchorStatusDoesNotEmitContinuationGap:
      anchorStatus !== "CONTINUATION_PRIORITY_DOELJI_GAP"
      && anchor.slotId === FSV1_BOUNDARY_CONTINUATION_DOELJI_ANCHOR_SLOT_ID,
    // M
    anchorGoldIntentContinuation:
      anchor.evidence.goldIntent === "continuation"
      && anchor.goldRow.gold.expectedIntent === "continuation",
    // N
    anchorRawGoldEqualsRawReader: anchor.rawGoldEqualsRawReader === true,
    // O
    bContrastIsNotContinuationStatus:
      bStatusText !== "CONTINUATION_PRIORITY_DOELJI_GAP"
      && bContrast.slotId === FSV1_BOUNDARY_CONTINUATION_DOELJI_B_CONTRAST_SLOT_ID
      && bStatus === "CONTRACT_CONFLICT",
    // P
    dContrastIsNotContinuationStatus:
      dStatusText !== "CONTINUATION_PRIORITY_DOELJI_GAP"
      && dContrast.slotId === FSV1_BOUNDARY_CONTINUATION_DOELJI_D_CONTRAST_SLOT_ID
      && dStatus === "VOCABULARY_AUTHORING_GAP",
    // Q
    eContrastIsNotContinuationStatus:
      eStatusText !== "CONTINUATION_PRIORITY_DOELJI_GAP"
      && eContrast.slotId === FSV1_BOUNDARY_CONTINUATION_DOELJI_E_CONTRAST_SLOT_ID
      && eStatus === "TERMINATION_PRIORITY_DOELJI_GAP",
    // R
    bDeContinuationStatusesIndependent:
      continuationStatus === "CONTINUATION_PRIORITY_DOELJI_GAP"
      && bStatus === "CONTRACT_CONFLICT"
      && dStatus === "VOCABULARY_AUTHORING_GAP"
      && eStatus === "TERMINATION_PRIORITY_DOELJI_GAP"
      && continuationStatusText !== bStatusText
      && continuationStatusText !== dStatusText
      && continuationStatusText !== eStatusText
      && bStatusText !== dStatusText
      && bStatusText !== eStatusText
      && dStatusText !== eStatusText,
    // S — this verification module is not wired into FSV1 official pipeline.
    continuationObservationNotImportedByOfficialPipeline: true,
    slotIdIsPrimaryBuyA004:
      row.slotId === FSV1_BOUNDARY_CONTINUATION_PRIORITY_DOELJI_GAP_SLOT_ID,
    goldDecisionTargetBuy:
      row.goldRow.gold.expectedDecisionTarget === "buy",
    actualDecisionTargetBuy: row.actual.decisionTarget === "buy",
    anchorDecisionTargetContinue:
      anchor.evidence.decisionTarget === "continue"
      && anchor.goldRow.gold.expectedDecisionTarget === "continue",
    anchorPhase1IntentContinuation:
      anchor.evidence.phase1Intent === "continuation",
    noOfficialFailureLabelAttached:
      row.compare.failureClassification === null,
    notContractConflictStatus:
      continuationStatus !== ("CONTRACT_CONFLICT" as string),
    notVocabularyAuthoringGapStatus:
      continuationStatus !== ("VOCABULARY_AUTHORING_GAP" as string),
    notTerminationPriorityDoeljiGapStatus:
      continuationStatus !== ("TERMINATION_PRIORITY_DOELJI_GAP" as string),
  } as const;

  for (const [key, ok] of Object.entries(checks)) {
    if (!ok) violations.push(key);
  }

  return {
    step: FSV1_BOUNDARY_CONTINUATION_DOELJI_OBSERVATION_STEP,
    passed: violations.length === 0,
    row,
    anchor,
    bContrast,
    dContrast,
    eContrast,
    checks,
    violations,
  };
}

export function serializeFsv1BoundaryContinuationDoeljiObservationVerificationResult(
  result: Fsv1BoundaryContinuationDoeljiObservationVerificationResult,
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
        rawGoldEqualsRawReader: result.row.rawGoldEqualsRawReader,
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
      anchor: {
        slotId: result.anchor.slotId,
        observationalStatus: result.anchor.observationalStatus,
        compareMatch: result.anchor.compare.match,
        rawGoldEqualsRawReader: result.anchor.rawGoldEqualsRawReader,
        gold: {
          expectedIntent: result.anchor.goldRow.gold.expectedIntent,
          expectedDecisionTarget:
            result.anchor.goldRow.gold.expectedDecisionTarget,
        },
        actual: result.anchor.actual,
        evidence: result.anchor.evidence,
        note: result.anchor.note,
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
      eContrast: {
        slotId: result.eContrast.slotId,
        observationalStatus: result.eContrast.observationalStatus,
        compareMatch: result.eContrast.compare.match,
        evidence: result.eContrast.evidence,
      },
    },
    null,
    2,
  );
}
