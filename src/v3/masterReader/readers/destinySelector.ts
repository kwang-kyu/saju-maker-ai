import type {
    DestinyArea,
    DestinyLevel,
  } from "../types/destiny.js";
  import type {
    MatchedDestinyRule,
  } from "../rules/destinyRules.js";
  import type {
    DestinyAreaScore,
  } from "./destinyScorer.js";
  
  export type DestinySelectionStatus =
    | "clear"
    | "mixed"
    | "insufficient";
  
  export type DestinyAreaSelection = {
    area: DestinyArea;
  
    level: DestinyLevel | null;
  
    status: DestinySelectionStatus;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportingMatches:
      MatchedDestinyRule[];
  
    limitingMatches:
      MatchedDestinyRule[];
  
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
    match: MatchedDestinyRule,
  ): boolean {
    return (
      match.rule.signalKinds
        !== undefined
      || match.rule.signalMatcher
        !== undefined
    );
  }
  
  function countSignalMatches(
    matches: MatchedDestinyRule[],
  ): number {
    return matches.filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function hasAnyEvidence(
    score: DestinyAreaScore,
  ): boolean {
    return (
      score.supportMatches.length > 0
      || score.limitMatches.length > 0
    );
  }
  
  function isMixedScore(
    score: DestinyAreaScore,
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
  
  function selectDestinyLevel(
    score: DestinyAreaScore,
    signalSupportCount: number,
  ): DestinyLevel {
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
  
  function selectDestinyStatus(
    score: DestinyAreaScore,
  ): DestinySelectionStatus {
    if (!hasAnyEvidence(score)) {
      return "insufficient";
    }
  
    if (isMixedScore(score)) {
      return "mixed";
    }
  
    return "clear";
  }
  
  function selectDestinyArea(
    score: DestinyAreaScore,
  ): DestinyAreaSelection {
    const signalSupportCount =
      countSignalMatches(
        score.supportMatches,
      );
  
    const signalLimitCount =
      countSignalMatches(
        score.limitMatches,
      );
  
    const status =
      selectDestinyStatus(score);
  
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
        selectDestinyLevel(
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
  
  export function selectDestinyAreas(
    scores: DestinyAreaScore[],
  ): DestinyAreaSelection[] {
    return scores.map(
      selectDestinyArea,
    );
  }