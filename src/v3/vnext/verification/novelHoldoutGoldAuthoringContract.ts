/**
 * Novel Holdout — Gold Authoring Contract (verification-only).
 *
 * Locks human Gold authoring policy for Exact Match / carve-outs.
 * Does NOT import QuestionReader / questionMeaningAdapter / FSV1 Gold tables.
 * Does NOT invent production intent enums or typed secondarySpeechAct fields.
 */

/**
 * Contract revision. Bump only when authoring policy itself changes.
 */
export const NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION =
  "novel-holdout-gold-authoring-contract-r1" as const;

export type NovelHoldoutGoldAuthoringContractRevision =
  typeof NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION;

/**
 * Verification-local primary speech-act labels for Gold authoring SoT.
 * Not a production QuestionIntent enum extension.
 */
export type NovelHoldoutGoldAuthoringPrimaryIntent =
  | "possibility"
  | "evaluation"
  | "selection"
  | "comparison"
  | "timing"
  | "reason"
  | "method"
  | "risk"
  | "prediction"
  | "existence"
  | "permission"
  | "continuation"
  | "termination"
  | "generalJudgement";

/**
 * decisionAxisHint is soft family guidance only — never forces expectedIntent.
 */
export const NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY =
  "SOFT_GUIDANCE" as const;

export type NovelHoldoutDecisionAxisHintPolicy =
  typeof NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY;

/**
 * Exact Match compares exactly one primary expectedIntent.
 */
export const NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY = {
  sot: "single_primary_speech_act",
  exactMatchCompares: "primary_intent_only",
  dualSurfaceAutoRewrite: false,
  readerKeywordIsOracle: false,
  readerPriorityIsOracle: false,
  decisionAxisHintForcesExpectedIntent: false,
} as const;

export type NovelHoldoutGoldPrimaryIntentPolicy =
  typeof NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY;

/**
 * Typed secondarySpeechAct fields are forbidden on Gold authoring records.
 */
export const NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY =
  "PROHIBITED" as const;

export type NovelHoldoutSecondarySpeechActTypedFieldPolicy =
  typeof NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY;

/**
 * Reason-primary carve-out checklist (R1–R4).
 * All four must be true for reason-primary recognition.
 */
export type NovelHoldoutReasonPrimaryChecklist = {
  /**
   * R1. Core need is reason/grounds themselves, not action fitness/possibility.
   */
  r1CoreIsReasonGroundNotActionFitness: boolean;
  /**
   * R2. Why / reason / evidence is the primary information need.
   */
  r2WhyReasonEvidenceIsPrimaryInformationNeed: boolean;
  /**
   * R3. Presence of an action DecisionTarget does not block reason-primary.
   * (Checklist affirmation: author treats reason-primary as still allowed.)
   */
  r3ActionDecisionTargetDoesNotBlockReasonPrimary: boolean;
  /**
   * R4. A single keyword alone does not decide reason-primary.
   */
  r4NotDeterminedByKeywordAlone: boolean;
};

export const NOVEL_HOLDOUT_REASON_PRIMARY_CHECKLIST_KEYS = [
  "r1CoreIsReasonGroundNotActionFitness",
  "r2WhyReasonEvidenceIsPrimaryInformationNeed",
  "r3ActionDecisionTargetDoesNotBlockReasonPrimary",
  "r4NotDeterminedByKeywordAlone",
] as const;

/**
 * Selection semantic roles (S1–S4). Not automatic expectedIntent rewrites.
 */
export type NovelHoldoutSelectionSemanticRole =
  | "possibility"
  | "comparison"
  | "framing"
  | "keyword_only_non_primary"
  | "selection_primary_reserved"
  | "unclassified";

export const NOVEL_HOLDOUT_SELECTION_SEMANTIC_ROLE_DEFINITIONS = {
  S1_POSSIBILITY_SINGLE_ACTION:
    '"가능한 선택인지" / single-action possibility surface '
    + "is treated as possibility, not automatic selection-primary.",
  S2_COMPARISON_EXPLICIT_AB:
    "Explicit A/B opposition may be comparison surface.",
  S3_FRAMING_DIRECTION:
    '"어느 쪽 문제로" / "어느 쪽으로 잡아야" framing/direction '
    + "expressions do not auto-promote to selection-primary.",
  S4_KEYWORD_ONLY_NO_AUTO_PRIMARY:
    "Selection keyword presence alone must not auto-change "
    + "expectedIntent to selection.",
} as const;

/**
 * Selection-primary positive Gold SoT is currently absent.
 * Keep as reserved future carve-out placeholder only.
 */
export const NOVEL_HOLDOUT_SELECTION_PRIMARY_CARVE_OUT_STATUS =
  "RESERVED_FUTURE_EMPTY" as const;

export type NovelHoldoutSelectionPrimaryCarveOutStatus =
  typeof NOVEL_HOLDOUT_SELECTION_PRIMARY_CARVE_OUT_STATUS;

/**
 * Empty reserved list — no current selection-primary positive fixtures.
 */
export const NOVEL_HOLDOUT_SELECTION_PRIMARY_POSITIVE_FIXTURES:
  readonly never[] = [];

/**
 * Gold authoring record shape (verification-local).
 * Intentionally omits secondarySpeechAct.
 */
export type NovelHoldoutGoldAuthoringRecord = {
  expectedIntent: NovelHoldoutGoldAuthoringPrimaryIntent;
  decisionAxisHint?: string;
  dualSurfaces?: readonly string[];
  readerKeywordHint?: string;
  selectionKeywordPresent?: boolean;
};

export const NOVEL_HOLDOUT_GOLD_AUTHORING_RECORD_ALLOWED_KEYS = [
  "expectedIntent",
  "decisionAxisHint",
  "dualSurfaces",
  "readerKeywordHint",
  "selectionKeywordPresent",
] as const;

/**
 * R1–R4 must all hold for reason-primary carve-out.
 */
export function isNovelHoldoutReasonPrimaryCarveOut(
  checklist: NovelHoldoutReasonPrimaryChecklist,
): boolean {
  return (
    checklist.r1CoreIsReasonGroundNotActionFitness
    && checklist.r2WhyReasonEvidenceIsPrimaryInformationNeed
    && checklist.r3ActionDecisionTargetDoesNotBlockReasonPrimary
    && checklist.r4NotDeterminedByKeywordAlone
  );
}

/**
 * Exact Match: compare one primary intent only.
 */
export function matchNovelHoldoutGoldPrimaryIntentExact(
  expectedIntent: NovelHoldoutGoldAuthoringPrimaryIntent,
  actualPrimaryIntent: NovelHoldoutGoldAuthoringPrimaryIntent,
): boolean {
  return expectedIntent === actualPrimaryIntent;
}

/**
 * Authoring resolver: dual-surface / reader keyword / decisionAxisHint
 * must not rewrite the authored primary expectedIntent.
 */
export function resolveNovelHoldoutGoldExpectedIntent(input: {
  authoredPrimaryIntent: NovelHoldoutGoldAuthoringPrimaryIntent;
  dualSurfaces?: readonly string[];
  readerKeywordHint?: string | null;
  readerPriorityHint?: string | null;
  decisionAxisHint?: string | null;
  selectionKeywordPresent?: boolean;
}): NovelHoldoutGoldAuthoringPrimaryIntent {
  void input.dualSurfaces;
  void input.readerKeywordHint;
  void input.readerPriorityHint;
  void input.decisionAxisHint;
  void input.selectionKeywordPresent;
  return input.authoredPrimaryIntent;
}

/**
 * decisionAxisHint soft guidance never forces expectedIntent.
 */
export function doesDecisionAxisHintForceExpectedIntent(
  policy: NovelHoldoutDecisionAxisHintPolicy =
    NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY,
): boolean {
  return policy !== "SOFT_GUIDANCE"
    ? true
    : NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY
      .decisionAxisHintForcesExpectedIntent;
}

/**
 * Classify selection-related surface phrases into semantic roles (S1–S4).
 * Pure surface heuristics for contract verification — not a Reader oracle.
 */
export function classifyNovelHoldoutSelectionSurfaceRole(
  surface: string,
): NovelHoldoutSelectionSemanticRole {
  const text = surface.trim();
  if (text.length === 0) return "unclassified";

  if (
    text.includes("가능한 선택인지")
    || text.includes("가능한지 판단")
  ) {
    return "possibility";
  }

  if (
    text.includes("어느 쪽 문제로")
    || text.includes("어느 쪽으로 잡아야")
  ) {
    return "framing";
  }

  // Explicit A/B opposition markers (comparison surface may apply).
  if (
    (text.includes("A") && text.includes("B") && text.includes("vs"))
    || text.includes("둘 중")
    || text.includes("어느 쪽이 나을")
  ) {
    return "comparison";
  }

  // Selection keyword alone → non-primary (S4).
  if (
    text.includes("선택")
    || text.includes("골라")
    || text.toLowerCase().includes("selection")
  ) {
    return "keyword_only_non_primary";
  }

  return "unclassified";
}

/**
 * Selection keyword alone must never promote expectedIntent to selection.
 */
export function isSelectionPrimaryFromKeywordAlone(input: {
  authoredPrimaryIntent: NovelHoldoutGoldAuthoringPrimaryIntent;
  selectionKeywordPresent: boolean;
}): boolean {
  if (!input.selectionKeywordPresent) return false;
  const resolved = resolveNovelHoldoutGoldExpectedIntent({
    authoredPrimaryIntent: input.authoredPrimaryIntent,
    selectionKeywordPresent: true,
  });
  return (
    input.authoredPrimaryIntent !== "selection"
    && resolved === "selection"
  );
}

/**
 * Typed secondarySpeechAct field is prohibited on authoring records.
 */
export function goldAuthoringRecordHasSecondarySpeechActField(
  record: Record<string, unknown>,
): boolean {
  return Object.prototype.hasOwnProperty.call(record, "secondarySpeechAct");
}

/**
 * Contract-level affirmation that selection-primary positives are reserved/empty.
 */
export function isSelectionPrimaryPositiveFixtureReservedEmpty(): boolean {
  return (
    NOVEL_HOLDOUT_SELECTION_PRIMARY_CARVE_OUT_STATUS
      === "RESERVED_FUTURE_EMPTY"
    && NOVEL_HOLDOUT_SELECTION_PRIMARY_POSITIVE_FIXTURES.length === 0
  );
}
