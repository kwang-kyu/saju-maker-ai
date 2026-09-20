/**
 * P11-2 Novel Holdout — verification-only contract types.
 *
 * Scope:
 * - Independent Gold/Novelty/Leakage schema for Systematic Validation
 * - Does NOT contain actual holdout fixture rows (count = 0 in this step)
 * - Does NOT extend production QuestionReaderResult
 * - Does NOT promote Reference/Regression/exhaustive100 into Novel
 *
 * Split (P11-1):
 *   REFERENCE  = meaning-cell law book
 *   REGRESSION = promised behavior net
 *   NOVEL      = frozen generalization exam (sealed; not authored here)
 */

import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionTimingType,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";

/**
 * Semantic family bucket for sampling / reporting.
 * Not a new DecisionTarget; maps onto existing topic/DT space.
 */
export type NovelHoldoutFamily =
  | "business-start"
  | "business-continue"
  | "business-stop"
  | "business-buy"
  | "job-changeJob"
  | "job-leaveJob"
  | "realEstate-buy"
  | "realEstate-continue"
  | "realEstate-sell"
  | "money-invest"
  | "money-manageMoney"
  | "lifeDirection"
  | "relationship"
  | "general"
  | "other";

/**
 * Novelty taxonomy (primary required; secondary optional tags).
 * A–G scoring uses primary only.
 */
export type NovelHoldoutTaxonomy =
  | "A_SAME_MEANING_PARAPHRASE"
  | "B_TARGET_VARIATION"
  | "C_QUESTION_FORM_VARIATION"
  | "D_BOUNDARY_COLLISION"
  | "E_UNKNOWN_VOCABULARY"
  | "F_COMPOSITE"
  | "G_AMBIGUOUS_DESIGN_LIMIT";

/**
 * Novelty tier flags. Multiple flags allowed on one row.
 */
export type NovelHoldoutNoveltyTier =
  | "lexical"
  | "syntactic"
  | "combinational";

/**
 * How Exact / Coverage metrics treat the row.
 */
export type NovelHoldoutMatchPolicy =
  | "semantic_core"
  | "timing_sensitive"
  | "ambiguous"
  | "design_limit"
  | "composite";

export type NovelHoldoutGoldConfidence =
  | "high"
  | "medium"
  | "low";

export type NovelHoldoutAmbiguityLabel =
  | "AMBIGUOUS"
  | "DESIGN_LIMIT";

/**
 * Verification-only action lemma (surface/frame), not production DT enum.
 * Kept as branded string so gates can compare without inventing new DTs.
 */
export type NovelHoldoutActionLemma = string;

/**
 * Coarse object class for structural leakage (not Adapter object.label).
 */
export type NovelHoldoutObjectClass =
  | "business"
  | "job"
  | "money"
  | "realEstate"
  | "relationship"
  | "marriage"
  | "health"
  | "legal"
  | "lifeDirection"
  | "lifeFlow"
  | "general"
  | "cash"
  | "equity"
  | "unknown";

/**
 * Question-form skeleton used by Novelty C and leakage template checks.
 */
export type NovelHoldoutQuestionForm =
  | "possibility_ending"
  | "timing_when"
  | "recommendation_better"
  | "statement_worry"
  | "statement_hesitation"
  | "existence_ending"
  | "reason_why"
  | "other";

/**
 * Structural leakage key (P11-1 minimum):
 * normalize → tokenize → action lemma + object class
 * + question form + primaryAxis skeleton
 */
export type NovelHoldoutPrimaryAxisSkeleton =
  `${QuestionTopic}|${QuestionIntentOrLegacy}|${DecisionTarget}`;

export type NovelHoldoutStructuralKey = {
  normalized: string;
  tokens: readonly string[];
  actionLemma: NovelHoldoutActionLemma;
  objectClass: NovelHoldoutObjectClass;
  questionForm: NovelHoldoutQuestionForm;
  /**
   * Declared semantic skeleton when known from Reference/Regression
   * expected axes; "unknown|unknown|unknown" when candidate has none yet.
   */
  primaryAxisSkeleton: NovelHoldoutPrimaryAxisSkeleton | "unknown|unknown|unknown";
};

/**
 * Frozen holdout set version marker (content hash filled when fixtures exist).
 */
export type NovelHoldoutFrozenRevision = {
  holdoutVersion: string;
  contentHash: string | null;
};

/**
 * Novel Holdout row contract (verification-only).
 * P11-2 defines the type only — no concrete rows.
 */
export type NovelHoldoutRow = {
  id: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  taxonomySecondary?: readonly NovelHoldoutTaxonomy[];
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  question: string;
  expectedTopic: QuestionTopic;
  expectedIntent: QuestionIntentOrLegacy;
  expectedDecisionTarget: DecisionTarget;
  expectedTimingType?: QuestionTimingType;
  expectedAnalysisMode?: QuestionAnalysisMode;
  matchPolicy: NovelHoldoutMatchPolicy;
  goldConfidence: NovelHoldoutGoldConfidence;
  goldRationale: string;
  ambiguityLabel?: NovelHoldoutAmbiguityLabel | null;
  compositeNote?: string;
  boundaryAgainst?: string;
  frozenRevision: string;
};

/**
 * Empty frozen set for P11-2. Do not add rows in this step.
 */
export const NOVEL_HOLDOUT_ROWS_P11_2: readonly NovelHoldoutRow[] = [];

export const NOVEL_HOLDOUT_FROZEN_REVISION_P11_2: NovelHoldoutFrozenRevision = {
  holdoutVersion: "p11-2-schema-only",
  contentHash: null,
};

export type NovelHoldoutKnownPoolSource =
  | "reference_canonical"
  | "regression_surface"
  | "strong_anchor_subset"
  | "exhaustive100_leakage_compare_only"
  | "reader_verification_not_exported"
  /**
   * Curated questionReaderVerification surfaces (question text only).
   * Leakage/Novelty compare-only — never Blind Gold / Novel promotion.
   */
  | "reader_verification_leakage_compare_only"
  /**
   * Curated A1–A5 probe question surfaces (question text only).
   * Leakage/Novelty compare-only — never Blind Gold / Novel promotion.
   */
  | "probe_leakage_compare_only"
  /**
   * P11-4 authored / P11-5 accepted exposed question surfaces (question only).
   * Leakage/Novelty compare-only — never Blind Gold / Novel promotion.
   */
  | "p11_exposed_leakage_compare_only";

export type NovelHoldoutKnownQuestion = {
  id: string;
  question: string;
  source: NovelHoldoutKnownPoolSource;
  cellId: string | null;
  variationKind: string | null;
  primaryAxisSkeleton: NovelHoldoutPrimaryAxisSkeleton | "unknown|unknown|unknown";
  structuralKey: NovelHoldoutStructuralKey;
};

/**
 * Sources that may enter Known pool for leakage/novelty compare,
 * but must never be promoted into Blind Gold / Frozen Novel rows.
 */
export function isNovelHoldoutLeakageCompareOnlySource(
  source: NovelHoldoutKnownPoolSource,
): boolean {
  return (
    source === "exhaustive100_leakage_compare_only"
    || source === "reader_verification_leakage_compare_only"
    || source === "probe_leakage_compare_only"
    || source === "p11_exposed_leakage_compare_only"
  );
}
