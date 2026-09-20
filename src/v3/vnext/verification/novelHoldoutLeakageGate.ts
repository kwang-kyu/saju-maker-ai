/**
 * P11-2 Novel Holdout — Leakage Gate runner (verification-only).
 *
 * Structural leakage checks against Reference/Regression known pool.
 * Levenshtein/Jaccard are soft flags only — never sole reject/pass.
 *
 * Checks:
 * 1. exact duplicate
 * 2. normalized duplicate
 * 3. token overlap soft flag
 * 4. template overlap
 * 5. single synonym swap
 * 6. same canonical structure
 */

import type {
  NovelHoldoutKnownQuestion,
  NovelHoldoutPrimaryAxisSkeleton,
  NovelHoldoutStructuralKey,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import {
  buildNovelHoldoutStructuralKey,
  jaccardTokenOverlap,
  normalizeNovelHoldoutForDuplicate,
  normalizeNovelHoldoutText,
  normalizedLevenshteinSimilarity,
} from "./novelHoldoutStructuralAnalysis.js";

function toPrimaryAxisSkeletonOrUnknown(
  value: string | undefined,
): NovelHoldoutPrimaryAxisSkeleton | "unknown|unknown|unknown" {
  if (!value) {
    return "unknown|unknown|unknown";
  }

  const parts = value.split("|");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return "unknown|unknown|unknown";
  }

  return value as NovelHoldoutPrimaryAxisSkeleton;
}

export type NovelHoldoutLeakageCheckId =
  | "exact_duplicate"
  | "normalized_duplicate"
  | "token_overlap_soft"
  | "template_overlap"
  | "single_synonym_swap"
  | "same_canonical_structure";

export type NovelHoldoutLeakageFindingSeverity =
  | "reject"
  | "soft_flag";

export type NovelHoldoutLeakageFinding = {
  check: NovelHoldoutLeakageCheckId;
  severity: NovelHoldoutLeakageFindingSeverity;
  matchedKnownId: string | null;
  detail: string;
};

export type NovelHoldoutLeakageGateStatus =
  | "PASS"
  | "REJECT"
  | "SOFT_FLAG_ONLY";

export type NovelHoldoutLeakageGateResult = {
  status: NovelHoldoutLeakageGateStatus;
  passed: boolean;
  findings: readonly NovelHoldoutLeakageFinding[];
  rejectCount: number;
  softFlagCount: number;
  candidateStructuralKey: NovelHoldoutStructuralKey;
};

export type NovelHoldoutLeakageCandidate = {
  question: string;
  taxonomyPrimary?: NovelHoldoutTaxonomy;
  expectedPrimaryAxisSkeleton?: string;
};

function templateSkeleton(
  key: NovelHoldoutStructuralKey,
): string {
  return [
    key.objectClass,
    key.actionLemma,
    key.questionForm,
  ].join("|");
}

function tokenSymmetricDiffSize(
  left: readonly string[],
  right: readonly string[],
): number {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  let diff = 0;
  for (const token of leftSet) {
    if (!rightSet.has(token)) {
      diff += 1;
    }
  }
  for (const token of rightSet) {
    if (!leftSet.has(token)) {
      diff += 1;
    }
  }
  return diff;
}

/**
 * Evaluate Leakage Gate for one candidate against known pool.
 */
export function evaluateNovelHoldoutLeakageGate(
  candidate: NovelHoldoutLeakageCandidate,
  knownPool: readonly NovelHoldoutKnownQuestion[],
): NovelHoldoutLeakageGateResult {
  const taxonomy = candidate.taxonomyPrimary;
  const candidateKey = buildNovelHoldoutStructuralKey(
    candidate.question,
    toPrimaryAxisSkeletonOrUnknown(candidate.expectedPrimaryAxisSkeleton),
  );

  const findings: NovelHoldoutLeakageFinding[] = [];
  const candidateNormalizedDup = normalizeNovelHoldoutForDuplicate(
    candidate.question,
  );
  const candidateExact = normalizeNovelHoldoutText(candidate.question);
  const candidateTemplate = templateSkeleton(candidateKey);

  for (const known of knownPool) {
    const knownExact = known.structuralKey.normalized;
    const knownNormalizedDup = normalizeNovelHoldoutForDuplicate(known.question);

    if (candidateExact === knownExact) {
      findings.push({
        check: "exact_duplicate",
        severity: "reject",
        matchedKnownId: known.id,
        detail: "exact surface match after whitespace/case normalize",
      });
      continue;
    }

    if (candidateNormalizedDup === knownNormalizedDup) {
      findings.push({
        check: "normalized_duplicate",
        severity: "reject",
        matchedKnownId: known.id,
        detail: "normalized duplicate after ending/particle strip",
      });
    }

    const jaccard = jaccardTokenOverlap(
      candidateKey.tokens,
      known.structuralKey.tokens,
    );
    const lev = normalizedLevenshteinSimilarity(
      candidateKey.normalized,
      known.structuralKey.normalized,
    );

    // Soft flag only — never sole Novel reject.
    const softThreshold = taxonomy === "C_QUESTION_FORM_VARIATION"
      ? 0.92
      : taxonomy === "A_SAME_MEANING_PARAPHRASE"
        ? 0.75
        : 0.85;

    if (jaccard >= softThreshold || lev >= softThreshold) {
      findings.push({
        check: "token_overlap_soft",
        severity: "soft_flag",
        matchedKnownId: known.id,
        detail:
          `jaccard=${jaccard.toFixed(3)}; levSimilarity=${lev.toFixed(3)}; `
          + `threshold=${softThreshold} (soft only)`,
      });
    }

    const knownTemplate = templateSkeleton(known.structuralKey);
    if (candidateTemplate === knownTemplate) {
      const slotDiff = tokenSymmetricDiffSize(
        candidateKey.tokens,
        known.structuralKey.tokens,
      );

      // Same template + ≤1 slot change → weak template overlap (reject),
      // except explicit C form-only rows.
      if (slotDiff <= 2 && taxonomy !== "C_QUESTION_FORM_VARIATION") {
        findings.push({
          check: "template_overlap",
          severity: "reject",
          matchedKnownId: known.id,
          detail:
            `template=${candidateTemplate}; tokenSymmetricDiff=${slotDiff}`,
        });
      } else if (slotDiff <= 2 && taxonomy === "C_QUESTION_FORM_VARIATION") {
        findings.push({
          check: "template_overlap",
          severity: "soft_flag",
          matchedKnownId: known.id,
          detail:
            `C form-only: template=${candidateTemplate}; soft only`,
        });
      }
    }

    const actionChanged =
      candidateKey.actionLemma !== known.structuralKey.actionLemma
      && candidateKey.actionLemma !== "unknown"
      && known.structuralKey.actionLemma !== "unknown";
    const objectSame =
      candidateKey.objectClass === known.structuralKey.objectClass
      && candidateKey.objectClass !== "unknown";
    const formSame = candidateKey.questionForm === known.structuralKey.questionForm;
    const smallDiff = tokenSymmetricDiffSize(
      candidateKey.tokens,
      known.structuralKey.tokens,
    ) <= 2;

    if (actionChanged && objectSame && formSame && smallDiff) {
      findings.push({
        check: "single_synonym_swap",
        severity: "reject",
        matchedKnownId: known.id,
        detail:
          `verb/action swap only: ${known.structuralKey.actionLemma}`
          + `→${candidateKey.actionLemma}`,
      });
    }

    const objectChanged =
      candidateKey.objectClass !== known.structuralKey.objectClass
      && candidateKey.objectClass !== "unknown"
      && known.structuralKey.objectClass !== "unknown";
    const actionSame =
      candidateKey.actionLemma === known.structuralKey.actionLemma
      && candidateKey.actionLemma !== "unknown";

    if (objectChanged && actionSame && formSame && smallDiff) {
      findings.push({
        check: "single_synonym_swap",
        severity: "reject",
        matchedKnownId: known.id,
        detail:
          `noun/object swap only: ${known.structuralKey.objectClass}`
          + `→${candidateKey.objectClass}`,
      });
    }

    const sameAxis =
      candidate.expectedPrimaryAxisSkeleton
      && known.primaryAxisSkeleton !== "unknown|unknown|unknown"
      && candidate.expectedPrimaryAxisSkeleton === known.primaryAxisSkeleton;

    const sameActionFrame =
      candidateKey.actionLemma === known.structuralKey.actionLemma
      && candidateKey.objectClass === known.structuralKey.objectClass
      && candidateKey.actionLemma !== "unknown";

    if (sameAxis && sameActionFrame) {
      // Same canonical structure: reject for holdout majority;
      // A may soft-flag for human review rather than auto-pass.
      if (taxonomy === "A_SAME_MEANING_PARAPHRASE") {
        findings.push({
          check: "same_canonical_structure",
          severity: "soft_flag",
          matchedKnownId: known.id,
          detail:
            "same primaryAxis + action-frame; A limited allowance needs human cap",
        });
      } else {
        findings.push({
          check: "same_canonical_structure",
          severity: "reject",
          matchedKnownId: known.id,
          detail:
            `same canonical structure against ${known.primaryAxisSkeleton}`,
        });
      }
    }
  }

  const rejectCount = findings.filter((f) => f.severity === "reject").length;
  const softFlagCount = findings.filter((f) => f.severity === "soft_flag").length;

  let status: NovelHoldoutLeakageGateStatus;
  if (rejectCount > 0) {
    status = "REJECT";
  } else if (softFlagCount > 0) {
    status = "SOFT_FLAG_ONLY";
  } else {
    status = "PASS";
  }

  return {
    status,
    // Soft flags alone do not fail the gate; rejects do.
    passed: rejectCount === 0,
    findings,
    rejectCount,
    softFlagCount,
    candidateStructuralKey: candidateKey,
  };
}
