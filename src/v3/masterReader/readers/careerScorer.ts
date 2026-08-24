import type {
    CareerArea,
    CareerEvidence,
  } from "../types/career.js";
  import {
    matchCareerRules,
    type MatchedCareerRule,
  } from "../rules/careerRules.js";
  
  export type CareerAreaScore = {
    area: CareerArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches: MatchedCareerRule[];
  
    limitMatches: MatchedCareerRule[];
  };
  
  const CAREER_AREAS: CareerArea[] = [
    "roleOrientation",
    "workStyle",
    "expertiseGrowth",
    "organizationFit",
    "independenceFit",
    "leadershipFit",
    "performanceConversion",
    "careerContinuity",
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
    match: MatchedCareerRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher !== undefined
    );
  }
  
  function hasKeywordRequirement(
    match: MatchedCareerRule,
  ): boolean {
    return (
      match.rule.keywords !== undefined
      && match.rule.keywords.length > 0
    );
  }
  
  function getEvidenceIdentity(
    evidence: CareerEvidence,
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
    match: MatchedCareerRule,
  ): string {
    return [
      match.rule.id,
      getEvidenceIdentity(match.evidence),
    ].join("::");
  }
  
  function removeExactDuplicates(
    matches: MatchedCareerRule[],
  ): MatchedCareerRule[] {
    const seen = new Set<string>();
    const unique: MatchedCareerRule[] = [];
  
    for (const match of matches) {
      const identity =
        getMatchIdentity(match);
  
      if (seen.has(identity)) {
        continue;
      }
  
      seen.add(identity);
      unique.push(match);
    }
  
    return unique;
  }
  
  function removeKeywordFallbackDuplicates(
    matches: MatchedCareerRule[],
  ): MatchedCareerRule[] {
    const signalEvidenceKeys =
      new Set<string>();
  
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
  
      return !signalEvidenceKeys.has(
        evidenceKey,
      );
    });
  }
  
  function normalizeCareerMatches(
    matches: MatchedCareerRule[],
  ): MatchedCareerRule[] {
    const uniqueMatches =
      removeExactDuplicates(matches);
  
    return removeKeywordFallbackDuplicates(
      uniqueMatches,
    );
  }
  
  function calculateMatchScore(
    match: MatchedCareerRule,
  ): number {
    const evidenceMultiplier =
      getEvidenceWeightMultiplier(
        match.evidence.weight,
      );
  
    return (
      match.rule.score
      * evidenceMultiplier
    );
  }
  
  function calculateAreaScore(
    area: CareerArea,
    matches: MatchedCareerRule[],
  ): CareerAreaScore {
    const areaMatches = matches.filter(
      (match) =>
        match.rule.area === area,
    );
  
    const supportMatches =
      areaMatches.filter(
        (match) =>
          match.rule.direction === "support",
      );
  
    const limitMatches =
      areaMatches.filter(
        (match) =>
          match.rule.direction === "limit",
      );
  
    const supportScore =
      supportMatches.reduce(
        (total, match) =>
          total + calculateMatchScore(match),
        0,
      );
  
    const limitScore =
      limitMatches.reduce(
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
  
  export function scoreCareerAreas(
    evidenceList: CareerEvidence[],
  ): CareerAreaScore[] {
    const matchedRules =
      matchCareerRules(evidenceList);
  
    const normalizedMatches =
      normalizeCareerMatches(matchedRules);
  
    return CAREER_AREAS.map((area) =>
      calculateAreaScore(
        area,
        normalizedMatches,
      ),
    );
  }