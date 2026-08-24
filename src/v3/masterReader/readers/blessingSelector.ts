import type {
    BlessingArea,
    BlessingLevel,
  } from "../types/blessing.js";
  import type {
    MatchedBlessingRule,
  } from "../rules/blessingRules.js";
  import type {
    BlessingAreaScore,
  } from "./blessingScorer.js";
  
  export type BlessingSelectionStatus =
    | "clear"
    | "mixed"
    | "insufficient";
  
  export type BlessingAreaSelection = {
    area: BlessingArea;
  
    level: BlessingLevel | null;
  
    status: BlessingSelectionStatus;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportingMatches:
      MatchedBlessingRule[];
  
    limitingMatches:
      MatchedBlessingRule[];
  
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
    match: MatchedBlessingRule,
  ): boolean {
    return (
      match.rule.signalKinds
        !== undefined
      || match.rule.signalMatcher
        !== undefined
    );
  }
  
  function countSignalMatches(
    matches: MatchedBlessingRule[],
  ): number {
    return matches.filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function hasAnyEvidence(
    score: BlessingAreaScore,
  ): boolean {
    return (
      score.supportMatches.length > 0
      || score.limitMatches.length > 0
    );
  }
  
  function isMixedScore(
    score: BlessingAreaScore,
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
  
  function selectBlessingLevel(
    score: BlessingAreaScore,
    signalSupportCount: number,
  ): BlessingLevel {
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
  
  function selectBlessingStatus(
    score: BlessingAreaScore,
  ): BlessingSelectionStatus {
    if (!hasAnyEvidence(score)) {
      return "insufficient";
    }
  
    if (isMixedScore(score)) {
      return "mixed";
    }
  
    return "clear";
  }
  
  function selectBlessingArea(
    score: BlessingAreaScore,
  ): BlessingAreaSelection {
    const signalSupportCount =
      countSignalMatches(
        score.supportMatches,
      );
  
    const signalLimitCount =
      countSignalMatches(
        score.limitMatches,
      );
  
    const status =
      selectBlessingStatus(score);
  
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
        selectBlessingLevel(
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
  
  export function selectBlessingAreas(
    scores: BlessingAreaScore[],
  ): BlessingAreaSelection[] {
    return scores.map(
      selectBlessingArea,
    );
  }