/**
 * P11-3 / P11-6-1 Novel Holdout — failure classification (verification-only).
 *
 * Separates system gaps from ambiguous / design-limit rows.
 * Does NOT feed production QuestionReaderResult.
 *
 * P11-6-1: primaryFailure must reflect the actual mismatch cause.
 * Metadata alone (boundaryAgainst / medium confidence / vocab markers)
 * must not force BOUNDARY_ERROR / ORACLE_CONFLICT / VOCABULARY_GAP.
 */

import type {
  NovelHoldoutBlindGoldSnapshot,
  NovelHoldoutReaderActualSnapshot,
} from "./novelHoldoutBlindGoldProtocol.js";

export type NovelHoldoutFailureLabel =
  | "VOCABULARY_GAP"
  | "SEMANTIC_RULE_GAP"
  | "BOUNDARY_ERROR"
  | "ORACLE_CONFLICT"
  | "DESIGN_LIMIT"
  | "AMBIGUOUS"
  | "TIMING_ONLY_DRIFT"
  | "COMPOSITE_LIMIT";

export type NovelHoldoutFailureClassification = {
  primaryFailure: NovelHoldoutFailureLabel;
  secondaryFailures?: readonly NovelHoldoutFailureLabel[];
};

/**
 * Exact Match denominator policy:
 * - AMBIGUOUS / DESIGN_LIMIT rows may be excluded from Exact Match.
 * - They must not be counted as ordinary system failures.
 */
export function isExcludedFromExactMatchDenominator(
  classification: NovelHoldoutFailureClassification | null | undefined,
  ambiguityLabel?: "AMBIGUOUS" | "DESIGN_LIMIT" | null,
): boolean {
  if (ambiguityLabel === "AMBIGUOUS" || ambiguityLabel === "DESIGN_LIMIT") {
    return true;
  }

  if (!classification) {
    return false;
  }

  return (
    classification.primaryFailure === "AMBIGUOUS"
    || classification.primaryFailure === "DESIGN_LIMIT"
  );
}

export function isDesignLimitFailure(
  classification: NovelHoldoutFailureClassification | null | undefined,
): boolean {
  return classification?.primaryFailure === "DESIGN_LIMIT";
}

function isNoneOrGeneralFallback(
  actual: NovelHoldoutReaderActualSnapshot,
): boolean {
  if (actual.decisionTarget !== "none") {
    return false;
  }

  return (
    actual.intent === "evaluation"
    || actual.topic === "general"
    || actual.topic === "lifeFlow"
  );
}

function hasConcreteCompetingDecisionTarget(
  gold: NovelHoldoutBlindGoldSnapshot,
  actual: NovelHoldoutReaderActualSnapshot,
): boolean {
  return (
    actual.decisionTarget !== "none"
    && actual.decisionTarget !== gold.expectedDecisionTarget
  );
}

/**
 * Conservative Gold-vs-Actual classifier (P11-6-1).
 *
 * Priority (mismatch cause, not metadata presence):
 *   match / timing drift
 *   → explicit AMBIGUOUS / DESIGN_LIMIT
 *   → COMPOSITE_LIMIT
 *   → ORACLE_CONFLICT (DT locked, intent/policy conflict)
 *   → BOUNDARY_ERROR (real adjacent-axis move, or authored D collision)
 *   → AMBIGUOUS (competing concrete readings, non-high Gold confidence)
 *   → ORACLE_CONFLICT (timing form underspecified for asserted DT)
 *   → VOCABULARY_GAP (authored E taxonomy only — not marker presence alone)
 *   → SEMANTIC_RULE_GAP
 */
export function classifyNovelHoldoutGoldVsActualFailure(input: {
  gold: NovelHoldoutBlindGoldSnapshot;
  actual: NovelHoldoutReaderActualSnapshot | null;
  taxonomyPrimary: string;
  match: boolean;
  primaryAxisMatch: boolean;
  timingMatch: boolean | null;
  analysisModeMatch?: boolean | null;
}): NovelHoldoutFailureClassification | null {
  void input.analysisModeMatch;

  if (input.match && input.primaryAxisMatch) {
    if (
      input.timingMatch === false
      && input.gold.matchPolicy === "timing_sensitive"
    ) {
      return { primaryFailure: "TIMING_ONLY_DRIFT" };
    }
    return null;
  }

  if (input.gold.ambiguityLabel === "AMBIGUOUS") {
    return { primaryFailure: "AMBIGUOUS" };
  }
  if (input.gold.ambiguityLabel === "DESIGN_LIMIT") {
    return { primaryFailure: "DESIGN_LIMIT" };
  }
  if (input.gold.matchPolicy === "ambiguous") {
    return { primaryFailure: "AMBIGUOUS" };
  }
  if (input.gold.matchPolicy === "design_limit") {
    return { primaryFailure: "DESIGN_LIMIT" };
  }

  if (
    input.primaryAxisMatch
    && input.timingMatch === false
  ) {
    return { primaryFailure: "TIMING_ONLY_DRIFT" };
  }

  if (
    input.taxonomyPrimary === "F_COMPOSITE"
    || input.gold.matchPolicy === "composite"
    || Boolean(input.gold.compositeNote)
  ) {
    return { primaryFailure: "COMPOSITE_LIMIT" };
  }

  const actual = input.actual;
  if (!actual) {
    return { primaryFailure: "SEMANTIC_RULE_GAP" };
  }

  // DT locked to Gold but intent/policy differs → oracle / policy conflict.
  // boundaryAgainst alone must not win here (buy-A).
  if (
    actual.decisionTarget === input.gold.expectedDecisionTarget
    && actual.decisionTarget !== "none"
    && actual.intent !== input.gold.expectedIntent
  ) {
    return { primaryFailure: "ORACLE_CONFLICT" };
  }

  // Authored boundary-collision taxonomy: keep as BOUNDARY when mismatch.
  if (input.taxonomyPrimary === "D_BOUNDARY_COLLISION") {
    return { primaryFailure: "BOUNDARY_ERROR" };
  }

  // Real adjacent-family move: different topic + concrete DT (not none/fallback).
  // Example: business/start → money/manageMoney (start-B).
  // Do NOT classify mere none/general fallback as BOUNDARY even if boundaryAgainst set.
  if (
    actual.topic !== input.gold.expectedTopic
    && actual.decisionTarget !== "none"
    && !isNoneOrGeneralFallback(actual)
  ) {
    return { primaryFailure: "BOUNDARY_ERROR" };
  }

  // Competing concrete readings under non-high Gold confidence → AMBIGUOUS.
  // Example: continue vs choose (cont-C). Not automatic from boundaryAgainst.
  if (
    (input.gold.goldConfidence === "medium"
      || input.gold.goldConfidence === "low")
    && actual.topic === input.gold.expectedTopic
    && hasConcreteCompetingDecisionTarget(input.gold, actual)
  ) {
    return { primaryFailure: "AMBIGUOUS" };
  }

  // Timing-form Gold asserts a specific DT, but surface leaves DT underspecified.
  // medium/low confidence is metadata; the conflict is the underspecified policy.
  if (
    input.gold.matchPolicy === "timing_sensitive"
    && (input.gold.goldConfidence === "medium"
      || input.gold.goldConfidence === "low")
    && actual.intent === "timing"
    && actual.decisionTarget === "none"
  ) {
    return { primaryFailure: "ORACLE_CONFLICT" };
  }

  // Vocabulary gap only when authored as E — not from surface marker presence alone.
  // B-target with unusual noun stays SEMANTIC_RULE_GAP (buy-B / 푸드트럭).
  if (input.taxonomyPrimary === "E_UNKNOWN_VOCABULARY") {
    return { primaryFailure: "VOCABULARY_GAP" };
  }

  return { primaryFailure: "SEMANTIC_RULE_GAP" };
}
