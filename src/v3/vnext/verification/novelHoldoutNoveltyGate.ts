/**
 * P11-2 Novel Holdout — Novelty Gate runner (verification-only).
 *
 * Judges whether a *candidate* question may enter Novel Holdout
 * against the known Reference/Regression pool.
 *
 * Does NOT author Gold fixtures.
 * Does NOT use Reader actual as novelty oracle.
 * Levenshtein/Jaccard alone never decide Novel pass.
 */

import type {
  NovelHoldoutKnownQuestion,
  NovelHoldoutNoveltyTier,
  NovelHoldoutRow,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import {
  buildNovelHoldoutStructuralKey,
  jaccardTokenOverlap,
  normalizeNovelHoldoutText,
} from "./novelHoldoutStructuralAnalysis.js";

export type NovelHoldoutNoveltyWeakReason =
  | "single_noun_swap"
  | "single_verb_synonym_swap"
  | "ending_only_change"
  | "canonical_template_copy"
  | "none";

export type NovelHoldoutNoveltyGateStatus =
  | "PASS"
  | "REJECT"
  | "NEEDS_HUMAN_REVIEW";

export type NovelHoldoutNoveltyGateResult = {
  status: NovelHoldoutNoveltyGateStatus;
  passed: boolean;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  lexicalOk: boolean;
  syntacticOk: boolean;
  combinationalOk: boolean;
  weakVariation: NovelHoldoutNoveltyWeakReason;
  reasons: readonly string[];
  nearestKnownId: string | null;
  nearestJaccard: number | null;
};

export type NovelHoldoutNoveltyCandidate = {
  question: string;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  taxonomySecondary?: readonly NovelHoldoutTaxonomy[];
  /**
   * Author-declared tiers. Gate still verifies structural evidence;
   * undeclared tiers may be inferred as soft signals only.
   */
  noveltyTier?: readonly NovelHoldoutNoveltyTier[];
  /**
   * Optional declared axes for combinational / boundary checks.
   */
  expectedPrimaryAxisSkeleton?: string;
  boundaryAgainst?: string;
  compositeNote?: string;
  ambiguityLabel?: "AMBIGUOUS" | "DESIGN_LIMIT" | null;
};

const ENDING_ONLY_PATTERN =
  /(해도\s*될까요|해도\s*괜찮을까요|할까요|될까요|인가요|일까요|나요)\.?$/u;

function tokenSetDiffCount(
  left: readonly string[],
  right: readonly string[],
): { onlyLeft: number; onlyRight: number } {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  let onlyLeft = 0;
  let onlyRight = 0;
  for (const token of leftSet) {
    if (!rightSet.has(token)) {
      onlyLeft += 1;
    }
  }
  for (const token of rightSet) {
    if (!leftSet.has(token)) {
      onlyRight += 1;
    }
  }
  return { onlyLeft, onlyRight };
}

function detectWeakVariation(
  candidateQuestion: string,
  nearest: NovelHoldoutKnownQuestion | null,
): NovelHoldoutNoveltyWeakReason {
  if (!nearest) {
    return "none";
  }

  const candidateKey = buildNovelHoldoutStructuralKey(candidateQuestion);
  const knownKey = nearest.structuralKey;

  if (candidateKey.normalized === knownKey.normalized) {
    return "canonical_template_copy";
  }

  const candidateCore = normalizeNovelHoldoutText(candidateQuestion)
    .replace(ENDING_ONLY_PATTERN, "")
    .trim();
  const knownCore = normalizeNovelHoldoutText(nearest.question)
    .replace(ENDING_ONLY_PATTERN, "")
    .trim();

  if (candidateCore === knownCore && candidateKey.normalized !== knownKey.normalized) {
    return "ending_only_change";
  }

  if (
    candidateKey.actionLemma === knownKey.actionLemma
    && candidateKey.objectClass === knownKey.objectClass
    && candidateKey.questionForm === knownKey.questionForm
    && candidateKey.primaryAxisSkeleton === knownKey.primaryAxisSkeleton
  ) {
    const diff = tokenSetDiffCount(candidateKey.tokens, knownKey.tokens);
    if (diff.onlyLeft + diff.onlyRight <= 2) {
      if (
        candidateKey.actionLemma !== "unknown"
        && candidateKey.actionLemma === knownKey.actionLemma
        && diff.onlyLeft <= 1
        && diff.onlyRight <= 1
      ) {
        return "single_noun_swap";
      }
    }
  }

  if (
    candidateKey.objectClass === knownKey.objectClass
    && candidateKey.questionForm === knownKey.questionForm
    && candidateKey.actionLemma !== knownKey.actionLemma
    && candidateKey.actionLemma !== "unknown"
    && knownKey.actionLemma !== "unknown"
  ) {
    const diff = tokenSetDiffCount(candidateKey.tokens, knownKey.tokens);
    if (diff.onlyLeft + diff.onlyRight <= 2) {
      return "single_verb_synonym_swap";
    }
  }

  if (
    candidateKey.actionLemma === knownKey.actionLemma
    && candidateKey.objectClass !== "unknown"
    && knownKey.objectClass !== "unknown"
    && candidateKey.objectClass === knownKey.objectClass
    && candidateKey.questionForm === knownKey.questionForm
  ) {
    return "canonical_template_copy";
  }

  return "none";
}

function findNearestByJaccard(
  candidateTokens: readonly string[],
  knownPool: readonly NovelHoldoutKnownQuestion[],
): { known: NovelHoldoutKnownQuestion | null; jaccard: number | null } {
  let best: NovelHoldoutKnownQuestion | null = null;
  let bestScore = -1;

  for (const known of knownPool) {
    const score = jaccardTokenOverlap(candidateTokens, known.structuralKey.tokens);
    if (score > bestScore) {
      bestScore = score;
      best = known;
    }
  }

  return {
    known: best,
    jaccard: best === null ? null : bestScore,
  };
}

function evaluateLexicalEvidence(
  candidateQuestion: string,
  knownPool: readonly NovelHoldoutKnownQuestion[],
  nearestJaccard: number | null,
  weak: NovelHoldoutNoveltyWeakReason,
): { ok: boolean; signals: string[] } {
  const signals: string[] = [];
  const candidateKey = buildNovelHoldoutStructuralKey(candidateQuestion);

  let novelLemma = false;
  const knownLemmas = new Set(
    knownPool.flatMap((item) => item.structuralKey.tokens),
  );
  for (const token of candidateKey.tokens) {
    if (token.length >= 2 && !knownLemmas.has(token)) {
      novelLemma = true;
      break;
    }
  }
  if (novelLemma) {
    signals.push("content_lemma_absent_from_known_lexicon");
  }

  if (nearestJaccard !== null && nearestJaccard <= 0.55) {
    signals.push("content_token_jaccard_le_0_55");
  }

  let novelActionObjectPair = true;
  for (const known of knownPool) {
    if (
      known.structuralKey.actionLemma === candidateKey.actionLemma
      && known.structuralKey.objectClass === candidateKey.objectClass
      && candidateKey.actionLemma !== "unknown"
      && candidateKey.objectClass !== "unknown"
    ) {
      novelActionObjectPair = false;
      break;
    }
  }
  if (novelActionObjectPair && candidateKey.actionLemma !== "unknown") {
    signals.push("action_object_pair_not_in_known_pool");
  }

  if (weak !== "none") {
    return { ok: false, signals: [...signals, `weak:${weak}`] };
  }

  return { ok: signals.length >= 2, signals };
}

function evaluateSyntacticEvidence(
  candidateQuestion: string,
  nearest: NovelHoldoutKnownQuestion | null,
  weak: NovelHoldoutNoveltyWeakReason,
  taxonomyPrimary: NovelHoldoutTaxonomy,
): { ok: boolean; signals: string[] } {
  const signals: string[] = [];
  const candidateKey = buildNovelHoldoutStructuralKey(candidateQuestion);

  if (!nearest) {
    return { ok: false, signals: ["no_nearest_known_for_syntactic_compare"] };
  }

  if (candidateKey.questionForm !== nearest.structuralKey.questionForm) {
    signals.push("question_form_changed");
  }

  if (
    /면|지만|거나|거나\s*|만약|혹시|보다는|대신/.test(candidateKey.normalized)
    && !/면|지만|거나|만약|혹시|보다는|대신/.test(nearest.structuralKey.normalized)
  ) {
    signals.push("clause_structure_changed");
  }

  if (
    candidateKey.questionForm === "statement_worry"
    || candidateKey.questionForm === "statement_hesitation"
    || candidateKey.questionForm === "recommendation_better"
  ) {
    if (nearest.structuralKey.questionForm === "possibility_ending") {
      signals.push("modality_frame_changed");
    }
  }

  if (taxonomyPrimary === "C_QUESTION_FORM_VARIATION") {
    // Form-only is allowed for C; weak ending-only is acceptable under C.
    const formOnlyOk =
      signals.includes("question_form_changed")
      || signals.includes("modality_frame_changed")
      || weak === "ending_only_change";
    return { ok: formOnlyOk, signals };
  }

  if (weak !== "none") {
    return { ok: false, signals: [...signals, `weak:${weak}`] };
  }

  return { ok: signals.length >= 1, signals };
}

function evaluateCombinationalEvidence(
  candidate: NovelHoldoutNoveltyCandidate,
  nearest: NovelHoldoutKnownQuestion | null,
): { ok: boolean; signals: string[] } {
  const signals: string[] = [];
  const candidateKey = buildNovelHoldoutStructuralKey(candidate.question);

  if (!nearest) {
    return { ok: false, signals: ["no_nearest_known_for_combinational_compare"] };
  }

  let dimensionChanges = 0;
  if (candidateKey.actionLemma !== nearest.structuralKey.actionLemma) {
    dimensionChanges += 1;
    signals.push("action_lemma_dimension_changed");
  }
  if (candidateKey.objectClass !== nearest.structuralKey.objectClass) {
    dimensionChanges += 1;
    signals.push("object_class_dimension_changed");
  }
  if (
    candidate.expectedPrimaryAxisSkeleton
    && nearest.primaryAxisSkeleton !== "unknown|unknown|unknown"
    && candidate.expectedPrimaryAxisSkeleton !== nearest.primaryAxisSkeleton
  ) {
    dimensionChanges += 1;
    signals.push("primary_axis_skeleton_changed");
  }
  if (candidateKey.questionForm !== nearest.structuralKey.questionForm) {
    dimensionChanges += 1;
    signals.push("question_form_dimension_changed");
  }

  if (dimensionChanges >= 2) {
    signals.push("multi_dimension_change_ge_2");
  }

  if (candidate.boundaryAgainst) {
    signals.push("boundary_collision_declared");
  }

  if (candidate.compositeNote || candidate.taxonomyPrimary === "F_COMPOSITE") {
    signals.push("composite_structure_declared");
  }

  const ok =
    signals.includes("multi_dimension_change_ge_2")
    || signals.includes("boundary_collision_declared")
    || signals.includes("composite_structure_declared");

  return { ok, signals };
}

/**
 * Evaluate Novelty Gate for one candidate against known pool.
 */
export function evaluateNovelHoldoutNoveltyGate(
  candidate: NovelHoldoutNoveltyCandidate,
  knownPool: readonly NovelHoldoutKnownQuestion[],
): NovelHoldoutNoveltyGateResult {
  const taxonomyPrimary = candidate.taxonomyPrimary;
  const declaredTiers = candidate.noveltyTier ?? [];
  const candidateKey = buildNovelHoldoutStructuralKey(candidate.question);
  const nearest = findNearestByJaccard(candidateKey.tokens, knownPool);
  const weak = detectWeakVariation(candidate.question, nearest.known);

  if (taxonomyPrimary === "G_AMBIGUOUS_DESIGN_LIMIT") {
    const hasAmbiguityLabel =
      candidate.ambiguityLabel === "AMBIGUOUS"
      || candidate.ambiguityLabel === "DESIGN_LIMIT";

    return {
      status: hasAmbiguityLabel ? "PASS" : "NEEDS_HUMAN_REVIEW",
      passed: hasAmbiguityLabel,
      taxonomyPrimary,
      noveltyTier: declaredTiers,
      lexicalOk: false,
      syntacticOk: false,
      combinationalOk: false,
      weakVariation: weak,
      reasons: hasAmbiguityLabel
        ? [
            "G prioritizes ambiguity/design-limit label over novelty evidence",
            `ambiguityLabel=${candidate.ambiguityLabel}`,
          ]
        : [
            "G requires ambiguityLabel AMBIGUOUS or DESIGN_LIMIT",
          ],
      nearestKnownId: nearest.known?.id ?? null,
      nearestJaccard: nearest.jaccard,
    };
  }

  const lexical = evaluateLexicalEvidence(
    candidate.question,
    knownPool,
    nearest.jaccard,
    weak,
  );
  const syntactic = evaluateSyntacticEvidence(
    candidate.question,
    nearest.known,
    weak,
    taxonomyPrimary,
  );
  const combinational = evaluateCombinationalEvidence(candidate, nearest.known);

  const reasons: string[] = [];
  reasons.push(...lexical.signals.map((s) => `lexical:${s}`));
  reasons.push(...syntactic.signals.map((s) => `syntactic:${s}`));
  reasons.push(...combinational.signals.map((s) => `combinational:${s}`));

  let passed = false;

  if (
    taxonomyPrimary === "A_SAME_MEANING_PARAPHRASE"
    || taxonomyPrimary === "B_TARGET_VARIATION"
    || taxonomyPrimary === "E_UNKNOWN_VOCABULARY"
  ) {
    // A/B/E: lexical OR syntactic required; weak alone rejected.
    if (weak !== "none" && taxonomyPrimary !== "E_UNKNOWN_VOCABULARY") {
      passed = false;
      reasons.push(`reject:weak_variation_alone:${weak}`);
    } else {
      passed = lexical.ok || syntactic.ok;
      if (!passed) {
        reasons.push("reject:A/B/E require lexical or syntactic novelty");
      }
    }
  } else if (taxonomyPrimary === "C_QUESTION_FORM_VARIATION") {
    // Form-only allowed; do not also score as A.
    passed = syntactic.ok;
    if (!passed) {
      reasons.push("reject:C requires form/modality change evidence");
    }
    if (declaredTiers.includes("lexical") && !syntactic.ok) {
      reasons.push("note:C must not be double-scored as A paraphrase");
    }
  } else if (
    taxonomyPrimary === "D_BOUNDARY_COLLISION"
    || taxonomyPrimary === "F_COMPOSITE"
  ) {
    passed = combinational.ok;
    if (!passed) {
      reasons.push("reject:D/F require combinational novelty");
    }
  }

  const inferredTiers: NovelHoldoutNoveltyTier[] = [...declaredTiers];
  if (lexical.ok && !inferredTiers.includes("lexical")) {
    inferredTiers.push("lexical");
  }
  if (syntactic.ok && !inferredTiers.includes("syntactic")) {
    inferredTiers.push("syntactic");
  }
  if (combinational.ok && !inferredTiers.includes("combinational")) {
    inferredTiers.push("combinational");
  }

  return {
    status: passed ? "PASS" : "REJECT",
    passed,
    taxonomyPrimary,
    noveltyTier: inferredTiers,
    lexicalOk: lexical.ok,
    syntacticOk: syntactic.ok,
    combinationalOk: combinational.ok,
    weakVariation: weak,
    reasons,
    nearestKnownId: nearest.known?.id ?? null,
    nearestJaccard: nearest.jaccard,
  };
}

/**
 * Convenience: evaluate a NovelHoldoutRow-shaped candidate (no fixture required).
 */
export function evaluateNovelHoldoutRowNoveltyGate(
  row: Pick<
    NovelHoldoutRow,
    | "question"
    | "taxonomyPrimary"
    | "taxonomySecondary"
    | "noveltyTier"
    | "boundaryAgainst"
    | "compositeNote"
    | "ambiguityLabel"
    | "expectedTopic"
    | "expectedIntent"
    | "expectedDecisionTarget"
  >,
  knownPool: readonly NovelHoldoutKnownQuestion[],
): NovelHoldoutNoveltyGateResult {
  return evaluateNovelHoldoutNoveltyGate(
    {
      question: row.question,
      taxonomyPrimary: row.taxonomyPrimary,
      taxonomySecondary: row.taxonomySecondary,
      noveltyTier: row.noveltyTier,
      expectedPrimaryAxisSkeleton:
        `${row.expectedTopic}|${row.expectedIntent}|${row.expectedDecisionTarget}`,
      boundaryAgainst: row.boundaryAgainst,
      compositeNote: row.compositeNote,
      ambiguityLabel: row.ambiguityLabel ?? null,
    },
    knownPool,
  );
}
