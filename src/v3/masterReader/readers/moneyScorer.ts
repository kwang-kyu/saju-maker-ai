import type {
    MoneyArea,
    MoneyEvidence,
  } from "../types/money";
  import {
    matchMoneyRules,
    type MatchedMoneyRule,
  } from "../rules/moneyRules";
  
  export type MoneyAreaScore = {
    area: MoneyArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches: MatchedMoneyRule[];
  
    limitMatches: MatchedMoneyRule[];
  };
  
  const MONEY_AREAS: MoneyArea[] = [
    "generation",
    "repeatability",
    "retention",
    "assetConversion",
    "cashflowManagement",
    "debtHandling",
    "volatilityResponse",
    "lossRecovery",
  ];
  
  function getEvidenceWeightMultiplier(
    weight: number,
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
  
  function hasSignalRequirement(
    match: MatchedMoneyRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher !== undefined
    );
  }
  
  function hasKeywordRequirement(
    match: MatchedMoneyRule,
  ): boolean {
    return (
      match.rule.keywords !== undefined
      && match.rule.keywords.length > 0
    );
  }
  
  function getEvidenceIdentity(
    evidence: MoneyEvidence,
  ): string {
    const signalKind =
      evidence.signal?.kind ?? "no-signal";
  
    return [
      evidence.source,
      signalKind,
      evidence.description,
      evidence.weight.toString(),
    ].join("::");
  }
  
  function getMatchIdentity(
    match: MatchedMoneyRule,
  ): string {
    return [
      match.rule.id,
      getEvidenceIdentity(match.evidence),
    ].join("::");
  }
  
  function removeExactDuplicates(
    matches: MatchedMoneyRule[],
  ): MatchedMoneyRule[] {
    const seen = new Set<string>();
    const unique: MatchedMoneyRule[] = [];
  
    for (const match of matches) {
      const identity = getMatchIdentity(match);
  
      if (seen.has(identity)) {
        continue;
      }
  
      seen.add(identity);
      unique.push(match);
    }
  
    return unique;
  }
  
  function removeKeywordFallbackDuplicates(
    matches: MatchedMoneyRule[],
  ): MatchedMoneyRule[] {
    const signalEvidenceKeys = new Set<string>();
  
    for (const match of matches) {
      if (!hasSignalRequirement(match)) {
        continue;
      }
  
      signalEvidenceKeys.add(
        [
          match.rule.area,
          match.rule.direction,
          getEvidenceIdentity(match.evidence),
        ].join("::"),
      );
    }
  
    return matches.filter((match) => {
      if (!hasKeywordRequirement(match)) {
        return true;
      }
  
      const evidenceKey = [
        match.rule.area,
        match.rule.direction,
        getEvidenceIdentity(match.evidence),
      ].join("::");
  
      return !signalEvidenceKeys.has(evidenceKey);
    });
  }
  
  function normalizeMoneyMatches(
    matches: MatchedMoneyRule[],
  ): MatchedMoneyRule[] {
    const uniqueMatches =
      removeExactDuplicates(matches);
  
    return removeKeywordFallbackDuplicates(
      uniqueMatches,
    );
  }
  
  function calculateMatchScore(
    match: MatchedMoneyRule,
  ): number {
    const evidenceMultiplier =
      getEvidenceWeightMultiplier(
        match.evidence.weight,
      );
  
    return match.rule.score * evidenceMultiplier;
  }
  
  function calculateAreaScore(
    area: MoneyArea,
    matches: MatchedMoneyRule[],
  ): MoneyAreaScore {
    const areaMatches = matches.filter(
      (match) => match.rule.area === area,
    );
  
    const supportMatches = areaMatches.filter(
      (match) =>
        match.rule.direction === "support",
    );
  
    const limitMatches = areaMatches.filter(
      (match) =>
        match.rule.direction === "limit",
    );
  
    const supportScore = supportMatches.reduce(
      (total, match) =>
        total + calculateMatchScore(match),
      0,
    );
  
    const limitScore = limitMatches.reduce(
      (total, match) =>
        total + calculateMatchScore(match),
      0,
    );
  
    return {
      area,
  
      supportScore,
  
      limitScore,
  
      finalScore:
        supportScore - limitScore,
  
      supportMatches,
  
      limitMatches,
    };
  }
  
  export function scoreMoneyAreas(
    evidenceList: MoneyEvidence[],
  ): MoneyAreaScore[] {
    const matchedRules =
      matchMoneyRules(evidenceList);
  
    const normalizedMatches =
      normalizeMoneyMatches(matchedRules);
  
    return MONEY_AREAS.map((area) =>
      calculateAreaScore(
        area,
        normalizedMatches,
      ),
    );
  }