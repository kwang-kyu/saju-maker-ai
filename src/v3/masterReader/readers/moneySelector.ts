import type {
    MoneyArea,
    MoneyLevel,
  } from "../types/money";
  import type {
    MatchedMoneyRule,
  } from "../rules/moneyRules";
  import type {
    MoneyAreaScore,
  } from "./moneyScorer";
  
  export type MoneySelectionStatus =
    | "clear"
    | "mixed"
    | "insufficient";
  
  export type MoneyAreaSelection = {
    area: MoneyArea;
  
    level: MoneyLevel | null;
  
    status: MoneySelectionStatus;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportingMatches: MatchedMoneyRule[];
  
    limitingMatches: MatchedMoneyRule[];
  
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
    match: MatchedMoneyRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher !== undefined
    );
  }
  
  function countSignalMatches(
    matches: MatchedMoneyRule[],
  ): number {
    return matches.filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function hasAnyEvidence(
    score: MoneyAreaScore,
  ): boolean {
    return (
      score.supportMatches.length > 0
      || score.limitMatches.length > 0
    );
  }
  
  function isMixedScore(
    score: MoneyAreaScore,
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
  
  function selectMoneyLevel(
    score: MoneyAreaScore,
    signalSupportCount: number,
  ): MoneyLevel {
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
  
  function selectMoneyStatus(
    score: MoneyAreaScore,
  ): MoneySelectionStatus {
    if (!hasAnyEvidence(score)) {
      return "insufficient";
    }
  
    if (isMixedScore(score)) {
      return "mixed";
    }
  
    return "clear";
  }
  
  function selectMoneyArea(
    score: MoneyAreaScore,
  ): MoneyAreaSelection {
    const signalSupportCount =
      countSignalMatches(score.supportMatches);
  
    const signalLimitCount =
      countSignalMatches(score.limitMatches);
  
    const status = selectMoneyStatus(score);
  
    if (status === "insufficient") {
      return {
        area: score.area,
  
        level: null,
  
        status,
  
        supportScore: score.supportScore,
  
        limitScore: score.limitScore,
  
        finalScore: score.finalScore,
  
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
  
      level: selectMoneyLevel(
        score,
        signalSupportCount,
      ),
  
      status,
  
      supportScore: score.supportScore,
  
      limitScore: score.limitScore,
  
      finalScore: score.finalScore,
  
      supportingMatches:
        score.supportMatches,
  
      limitingMatches:
        score.limitMatches,
  
      signalSupportCount,
  
      signalLimitCount,
    };
  }
  
  export function selectMoneyAreas(
    scores: MoneyAreaScore[],
  ): MoneyAreaSelection[] {
    return scores.map(selectMoneyArea);
  }