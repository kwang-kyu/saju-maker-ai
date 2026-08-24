import type {
    HealthArea,
    HealthLevel,
  } from "../types/health.js";
  import type {
    MatchedHealthRule,
  } from "../rules/healthRules.js";
  import type {
    HealthAreaScore,
  } from "./healthScorer.js";
  
  export type HealthSelectionStatus =
    | "clear"
    | "mixed"
    | "insufficient";
  
  export type HealthAreaSelection = {
    area: HealthArea;
  
    level: HealthLevel | null;
  
    status: HealthSelectionStatus;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportingMatches:
      MatchedHealthRule[];
  
    limitingMatches:
      MatchedHealthRule[];
  
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
    match: MatchedHealthRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher
        !== undefined
    );
  }
  
  function countSignalMatches(
    matches: MatchedHealthRule[],
  ): number {
    return matches.filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function hasAnyEvidence(
    score: HealthAreaScore,
  ): boolean {
    return (
      score.supportMatches.length > 0
      || score.limitMatches.length > 0
    );
  }
  
  function isMixedScore(
    score: HealthAreaScore,
  ): boolean {
    if (
      score.supportScore
        < MIXED_SCORE_THRESHOLD
      || score.limitScore
        < MIXED_SCORE_THRESHOLD
    ) {
      return false;
    }
  
    return (
      Math.abs(
        score.supportScore
        - score.limitScore,
      ) <= MIXED_SCORE_GAP
    );
  }
  
  function selectHealthLevel(
    score: HealthAreaScore,
    signalSupportCount: number,
  ): HealthLevel {
    if (
      score.limitScore
        >= LIMITED_LIMIT_SCORE
      && score.finalScore
        <= LIMITED_FINAL_SCORE
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
      score.supportScore
        >= STRONG_SUPPORT_SCORE
      && score.finalScore
        >= STRONG_FINAL_SCORE
      && signalSupportCount > 0
      && score.limitScore
        < score.supportScore
    ) {
      return "strong";
    }
  
    return "moderate";
  }
  
  function selectHealthStatus(
    score: HealthAreaScore,
  ): HealthSelectionStatus {
    if (!hasAnyEvidence(score)) {
      return "insufficient";
    }
  
    if (isMixedScore(score)) {
      return "mixed";
    }
  
    return "clear";
  }
  
  function selectHealthArea(
    score: HealthAreaScore,
  ): HealthAreaSelection {
    const signalSupportCount =
      countSignalMatches(
        score.supportMatches,
      );
  
    const signalLimitCount =
      countSignalMatches(
        score.limitMatches,
      );
  
    const status =
      selectHealthStatus(score);
  
    if (status === "insufficient") {
      return {
        area: score.area,
  
        level: null,
  
        status,
  
        supportScore:
          score.supportScore,
  
        limitScore:
          score.limitScore,
  
        finalScore:
          score.finalScore,
  
        supportingMatches:
          score.supportMatches,
  
        limitingMatches:
          score.limitMatches,
  
        signalSupportCount,
  
        signalLimitCount,
      };
    }
  
    return {
      area: score.area,
  
      level:
        selectHealthLevel(
          score,
          signalSupportCount,
        ),
  
      status,
  
      supportScore:
        score.supportScore,
  
      limitScore:
        score.limitScore,
  
      finalScore:
        score.finalScore,
  
      supportingMatches:
        score.supportMatches,
  
      limitingMatches:
        score.limitMatches,
  
      signalSupportCount,
  
      signalLimitCount,
    };
  }
  
  export function selectHealthAreas(
    scores: HealthAreaScore[],
  ): HealthAreaSelection[] {
    return scores.map(
      selectHealthArea,
    );
  }