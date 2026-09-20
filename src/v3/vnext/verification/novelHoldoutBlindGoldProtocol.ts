/**
 * P11-3 Blind Gold Protocol (verification-only).
 *
 * Gold author NEVER sees Reader actual while writing.
 * Required order:
 *   semantic family/taxonomy spec
 *   → new natural-language question
 *   → independent human Gold
 *   → Novelty Gate
 *   → Leakage Gate
 *   → holdout candidate
 *   → Frozen Set
 *
 * Forbidden:
 *   question → Reader run → adjust Gold to match Reader
 *
 * Reader actual is observation-only, attached after Gold is sealed.
 */

import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionTimingType,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import type {
  NovelHoldoutAmbiguityLabel,
  NovelHoldoutGoldConfidence,
  NovelHoldoutMatchPolicy,
  NovelHoldoutRow,
} from "./novelHoldoutContract.js";
import type {
  NovelHoldoutFailureClassification,
} from "./novelHoldoutFailureClassification.js";
import {
  isExcludedFromExactMatchDenominator,
} from "./novelHoldoutFailureClassification.js";

/**
 * Ordered Blind Gold stages. Numeric rank enforces forward-only progress.
 */
export const NOVEL_HOLDOUT_BLIND_GOLD_STAGES = [
  "SPEC_READY",
  "QUESTION_AUTHORED",
  "GOLD_SEALED",
  "NOVELTY_GATED",
  "LEAKAGE_GATED",
  "CANDIDATE_RESOLVED",
  "FROZEN",
  /** Verification-only: Reader actual may appear only after GOLD_SEALED. */
  "READER_OBSERVED",
] as const;

export type NovelHoldoutBlindGoldStage =
  (typeof NOVEL_HOLDOUT_BLIND_GOLD_STAGES)[number];

const STAGE_RANK: Readonly<Record<NovelHoldoutBlindGoldStage, number>> = {
  SPEC_READY: 0,
  QUESTION_AUTHORED: 1,
  GOLD_SEALED: 2,
  NOVELTY_GATED: 3,
  LEAKAGE_GATED: 4,
  CANDIDATE_RESOLVED: 5,
  FROZEN: 6,
  READER_OBSERVED: 7,
};

/**
 * Human Gold snapshot — authored without Reader actual.
 */
export type NovelHoldoutBlindGoldSnapshot = {
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
};

/**
 * Runtime Reader observation — never used as Gold source.
 */
export type NovelHoldoutReaderActualSnapshot = {
  topic: QuestionTopic;
  intent: QuestionIntentOrLegacy;
  decisionTarget: DecisionTarget;
  timingType?: QuestionTimingType;
  analysisMode?: QuestionAnalysisMode;
  /**
   * Provenance marker. Must remain "reader_runtime_observation".
   * Never "gold" / "fixture_expected".
   */
  provenance: "reader_runtime_observation";
};

export type NovelHoldoutGoldVsActualCompare = {
  gold: NovelHoldoutBlindGoldSnapshot;
  actual: NovelHoldoutReaderActualSnapshot | null;
  /**
   * null when actual has not been observed yet (blind phase).
   */
  match: boolean | null;
  primaryAxisMatch: boolean | null;
  timingMatch: boolean | null;
  analysisModeMatch: boolean | null;
  failureClassification: NovelHoldoutFailureClassification | null;
  /**
   * When true, row is omitted from Exact Match denominator.
   */
  excludeFromExactMatchDenominator: boolean;
};

export type NovelHoldoutBlindGoldInvariantResult = {
  ok: boolean;
  violations: readonly string[];
};

export function blindGoldStageRank(
  stage: NovelHoldoutBlindGoldStage,
): number {
  return STAGE_RANK[stage];
}

/**
 * Forward-only stage transition check (except READER_OBSERVED after GOLD_SEALED).
 */
export function assertBlindGoldStageTransition(
  from: NovelHoldoutBlindGoldStage,
  to: NovelHoldoutBlindGoldStage,
): NovelHoldoutBlindGoldInvariantResult {
  const violations: string[] = [];

  if (to === "READER_OBSERVED") {
    if (STAGE_RANK[from] < STAGE_RANK.GOLD_SEALED) {
      violations.push(
        "READER_OBSERVED is forbidden before GOLD_SEALED (Blind Gold)",
      );
    }
    return { ok: violations.length === 0, violations };
  }

  if (STAGE_RANK[to] < STAGE_RANK[from]) {
    violations.push(
      `backward stage transition forbidden: ${from} → ${to}`,
    );
  }

  if (STAGE_RANK[to] > STAGE_RANK[from] + 1 && to !== "FROZEN") {
    // Allow skipping intermediate gate bookkeeping only when already gated path
    // is merged; still reject jumping over GOLD_SEALED.
    if (
      STAGE_RANK[from] < STAGE_RANK.GOLD_SEALED
      && STAGE_RANK[to] > STAGE_RANK.GOLD_SEALED
    ) {
      violations.push(
        `cannot reach ${to} without GOLD_SEALED`,
      );
    }
  }

  return { ok: violations.length === 0, violations };
}

/**
 * Reject records that smuggle Reader actual into Gold authoring.
 */
export function assertBlindGoldSeparation(input: {
  stage: NovelHoldoutBlindGoldStage;
  gold: NovelHoldoutBlindGoldSnapshot | null;
  actual: NovelHoldoutReaderActualSnapshot | null;
  goldCopiedFromReader?: boolean;
}): NovelHoldoutBlindGoldInvariantResult {
  const violations: string[] = [];

  if (input.goldCopiedFromReader) {
    violations.push("Gold must not be copied from Reader actual");
  }

  if (
    input.actual !== null
    && STAGE_RANK[input.stage] < STAGE_RANK.GOLD_SEALED
  ) {
    violations.push(
      "Reader actual attached before Gold sealed (Blind Gold violation)",
    );
  }

  if (
    input.gold
    && input.actual
    && input.actual.provenance !== "reader_runtime_observation"
  ) {
    violations.push(
      "Reader actual provenance must be reader_runtime_observation",
    );
  }

  return { ok: violations.length === 0, violations };
}

function primaryAxisOfGold(
  gold: NovelHoldoutBlindGoldSnapshot,
): string {
  return [
    gold.expectedTopic,
    gold.expectedIntent,
    gold.expectedDecisionTarget,
  ].join("|");
}

function primaryAxisOfActual(
  actual: NovelHoldoutReaderActualSnapshot,
): string {
  return [actual.topic, actual.intent, actual.decisionTarget].join("|");
}

/**
 * Compare sealed Gold to optional Reader actual.
 * Does NOT call QuestionReader. Caller supplies actual if observed.
 */
export function compareBlindGoldToReaderActual(
  gold: NovelHoldoutBlindGoldSnapshot,
  actual: NovelHoldoutReaderActualSnapshot | null,
  failureClassification: NovelHoldoutFailureClassification | null = null,
): NovelHoldoutGoldVsActualCompare {
  if (actual === null) {
    return {
      gold,
      actual: null,
      match: null,
      primaryAxisMatch: null,
      timingMatch: null,
      analysisModeMatch: null,
      failureClassification,
      excludeFromExactMatchDenominator: isExcludedFromExactMatchDenominator(
        failureClassification,
        gold.ambiguityLabel,
      ),
    };
  }

  const primaryAxisMatch =
    primaryAxisOfGold(gold) === primaryAxisOfActual(actual);

  const timingMatch =
    (gold.expectedTimingType ?? null) === (actual.timingType ?? null);

  const analysisModeMatch =
    (gold.expectedAnalysisMode ?? null) === (actual.analysisMode ?? null);

  const match = primaryAxisMatch;

  return {
    gold,
    actual,
    match,
    primaryAxisMatch,
    timingMatch,
    analysisModeMatch,
    failureClassification,
    excludeFromExactMatchDenominator: isExcludedFromExactMatchDenominator(
      failureClassification,
      gold.ambiguityLabel,
    ),
  };
}

export function blindGoldSnapshotFromRow(
  row: NovelHoldoutRow,
): NovelHoldoutBlindGoldSnapshot {
  return {
    expectedTopic: row.expectedTopic,
    expectedIntent: row.expectedIntent,
    expectedDecisionTarget: row.expectedDecisionTarget,
    expectedTimingType: row.expectedTimingType,
    expectedAnalysisMode: row.expectedAnalysisMode,
    matchPolicy: row.matchPolicy,
    goldConfidence: row.goldConfidence,
    goldRationale: row.goldRationale,
    ambiguityLabel: row.ambiguityLabel,
    compositeNote: row.compositeNote,
    boundaryAgainst: row.boundaryAgainst,
  };
}
