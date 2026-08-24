import type {
    CapacityArea,
    CapacityLevel,
  } from "../types/capacity.js";
  import type {
    MatchedCapacityRule,
  } from "../rules/capacityRules.js";
  import type {
    CapacityAreaScore,
  } from "./capacityScorer.js";
  
  export type CapacitySelectionStatus =
    | "clear"
    | "mixed"
    | "insufficient";
  
  export type CapacityAreaSelection = {
    area: CapacityArea;
  
    level: CapacityLevel | null;
  
    status: CapacitySelectionStatus;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportingMatches: MatchedCapacityRule[];
  
    limitingMatches: MatchedCapacityRule[];
  
    signalSupportCount: number;
  
    signalLimitCount: number;
  };
  
  const STRONG_SUPPORT_SCORE = 4.5;
  const STRONG_FINAL_SCORE = 3;
  
  const LIMITED_LIMIT_SCORE = 4.5;
  const LIMITED_FINAL_SCORE = -2;
  
  const MIXED_SCORE_THRESHOLD = 3;
  const MIXED_SCORE_GAP = 1.5;
  
  function hasSignalRequirement(
    match: MatchedCapacityRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher !== undefined
    );
  }
  
  function countSignalMatches(
    matches: MatchedCapacityRule[],
  ): number {
    return matches.filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function hasAnyEvidence(
    score: CapacityAreaScore,
  ): boolean {
    return (
      score.supportMatches.length > 0
      || score.limitMatches.length > 0
    );
  }
  
  function isMixedScore(
    score: CapacityAreaScore,
  ): boolean {
    if (
      score.supportScore < MIXED_SCORE_THRESHOLD
      || score.limitScore < MIXED_SCORE_THRESHOLD
    ) {
      return false;
    }
  
    return (
      Math.abs(
        score.supportScore - score.limitScore,
      ) <= MIXED_SCORE_GAP
    );
  }
  
  function selectCapacityLevel(
    score: CapacityAreaScore,
    signalSupportCount: number,
  ): CapacityLevel {
    if (
      score.limitScore >= LIMITED_LIMIT_SCORE
      && score.finalScore <= LIMITED_FINAL_SCORE
    ) {
      return "limited";
    }
  
    if (
      score.supportScore === 0
      && score.limitScore > 0
    ) {
      return "limited";
    }
  
    if (
      score.supportScore >= STRONG_SUPPORT_SCORE
      && score.finalScore >= STRONG_FINAL_SCORE
      && signalSupportCount > 0
      && score.limitScore < score.supportScore
    ) {
      return "strong";
    }
  
    return "moderate";
  }
  
  function selectCapacityStatus(
    score: CapacityAreaScore,
  ): CapacitySelectionStatus {
    if (!hasAnyEvidence(score)) {
      return "insufficient";
    }
  
    if (isMixedScore(score)) {
      return "mixed";
    }
  
    return "clear";
  }
  
  function selectCapacityArea(
    score: CapacityAreaScore,
  ): CapacityAreaSelection {
    const signalSupportCount =
      countSignalMatches(score.supportMatches);
  
    const signalLimitCount =
      countSignalMatches(score.limitMatches);
  
    const status = selectCapacityStatus(score);
  
    if (status === "insufficient") {
      return {
        area: score.area,
  
        level: null,
  
        status,
  
        supportScore: score.supportScore,
  
        limitScore: score.limitScore,
  
        finalScore: score.finalScore,
  
        supportingMatches: score.supportMatches,
  
        limitingMatches: score.limitMatches,
  
        signalSupportCount,
  
        signalLimitCount,
      };
    }
  
    return {
      area: score.area,
  
      level: selectCapacityLevel(
        score,
        signalSupportCount,
      ),
  
      status,
  
      supportScore: score.supportScore,
  
      limitScore: score.limitScore,
  
      finalScore: score.finalScore,
  
      supportingMatches: score.supportMatches,
  
      limitingMatches: score.limitMatches,
  
      signalSupportCount,
  
      signalLimitCount,
    };
  }
  
  export function selectCapacityAreas(
    scores: CapacityAreaScore[],
  ): CapacityAreaSelection[] {
    return scores.map(selectCapacityArea);
  }