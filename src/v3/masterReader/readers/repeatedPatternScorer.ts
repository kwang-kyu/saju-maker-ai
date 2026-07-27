import type {
  PatternEvidence,
  RepeatedPatternType,
} from "../types/repeatedPattern";

import {
  matchRepeatedPatternRules,
  type MatchedRepeatedPatternRule,
} from "../rules/repeatedPatternRules";

export type RepeatedPatternScore = {
  pattern:
    RepeatedPatternType;

  score:
    number;

  matches:
    MatchedRepeatedPatternRule[];
};

const REPEATED_PATTERN_TYPES:
  RepeatedPatternType[] = [
    "earlySuccessCollapse",
    "slowGrowthStable",
    "relationshipLoss",
    "wealthLeak",
    "restartCycle",
    "responsibilityOverload",
    "lateBloom",
    "opportunityMiss",
    "distributedAdaptation",
  ];

function getEvidenceWeightMultiplier(
  weight:
    number,
): number {
  if (weight >= 3) {
    return 1.5;
  }

  if (weight === 2) {
    return 1;
  }

  if (weight === 1) {
    return 0.5;
  }

  return 0;
}

export function scoreRepeatedPatterns(
  evidenceList:
    PatternEvidence[],
): RepeatedPatternScore[] {
  const matches =
    matchRepeatedPatternRules(
      evidenceList,
    );

  const scores =
    new Map<
      RepeatedPatternType,
      RepeatedPatternScore
    >();

  for (
    const pattern
    of REPEATED_PATTERN_TYPES
  ) {
    scores.set(
      pattern,
      {
        pattern,

        score: 0,

        matches: [],
      },
    );
  }

  for (
    const match
    of matches
  ) {
    const current =
      scores.get(
        match.rule.pattern,
      );

    if (!current) {
      continue;
    }

    const evidenceMultiplier =
      getEvidenceWeightMultiplier(
        match.evidence.weight,
      );

    current.score +=
      match.rule.weight
      * evidenceMultiplier;

    current.matches.push(
      match,
    );
  }

  return Array.from(
    scores.values(),
  ).sort(
    (a, b) =>
      b.score - a.score,
  );
}