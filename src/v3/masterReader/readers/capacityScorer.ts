import type {
    CapacityArea,
    CapacityEvidence,
  } from "../types/capacity";
  import {
    matchCapacityRules,
    type MatchedCapacityRule,
  } from "../rules/capacityRules";
  
  export type CapacityAreaScore = {
    area: CapacityArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches: MatchedCapacityRule[];
  
    limitMatches: MatchedCapacityRule[];
  };
  
  const CAPACITY_AREAS: CapacityArea[] = [
    "responsibility",
    "money",
    "organization",
    "relationship",
    "risk",
    "time",
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
    match: MatchedCapacityRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher !== undefined
    );
  }
  
  function hasKeywordRequirement(
    match: MatchedCapacityRule,
  ): boolean {
    return (
      match.rule.keywords !== undefined
      && match.rule.keywords.length > 0
    );
  }
  
  function getEvidenceIdentity(
    evidence: CapacityEvidence,
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
    match: MatchedCapacityRule,
  ): string {
    return [
      match.rule.id,
      getEvidenceIdentity(match.evidence),
    ].join("::");
  }
  
  function removeExactDuplicates(
    matches: MatchedCapacityRule[],
  ): MatchedCapacityRule[] {
    const seen = new Set<string>();
    const unique: MatchedCapacityRule[] = [];
  
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
    matches: MatchedCapacityRule[],
  ): MatchedCapacityRule[] {
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
  
  function normalizeCapacityMatches(
    matches: MatchedCapacityRule[],
  ): MatchedCapacityRule[] {
    const uniqueMatches =
      removeExactDuplicates(matches);
  
    return removeKeywordFallbackDuplicates(
      uniqueMatches,
    );
  }
  
  function calculateMatchScore(
    match: MatchedCapacityRule,
  ): number {
    const evidenceMultiplier =
      getEvidenceWeightMultiplier(
        match.evidence.weight,
      );
  
    return match.rule.score * evidenceMultiplier;
  }
  
  function calculateAreaScore(
    area: CapacityArea,
    matches: MatchedCapacityRule[],
  ): CapacityAreaScore {
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
  
  export function scoreCapacityAreas(
    evidenceList: CapacityEvidence[],
  ): CapacityAreaScore[] {
    const matchedRules =
      matchCapacityRules(evidenceList);
  
    const normalizedMatches =
      normalizeCapacityMatches(matchedRules);
  
    return CAPACITY_AREAS.map((area) =>
      calculateAreaScore(
        area,
        normalizedMatches,
      ),
    );
  }