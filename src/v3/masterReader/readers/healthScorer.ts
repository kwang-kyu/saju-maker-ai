import type {
    HealthArea,
    HealthEvidence,
  } from "../types/health";
  import {
    matchHealthRules,
    type MatchedHealthRule,
  } from "../rules/healthRules";
  
  export type HealthAreaScore = {
    area: HealthArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches:
      MatchedHealthRule[];
  
    limitMatches:
      MatchedHealthRule[];
  };
  
  const HEALTH_AREAS:
    HealthArea[] = [
      "vitalityStability",
      "stressRegulation",
      "fatigueManagement",
      "recoveryCapacity",
      "rhythmMaintenance",
      "overloadTolerance",
      "habitSelfManagement",
      "imbalanceAdaptation",
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
    match: MatchedHealthRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher
        !== undefined
    );
  }
  
  function hasKeywordRequirement(
    match: MatchedHealthRule,
  ): boolean {
    return (
      match.rule.keywords !== undefined
      && match.rule.keywords.length > 0
    );
  }
  
  function getEvidenceIdentity(
    evidence: HealthEvidence,
  ): string {
    const signalKind =
      evidence.signal?.kind
      ?? "no-signal";
  
    return [
      evidence.source,
      signalKind,
      evidence.description,
      evidence.weight.toString(),
    ].join("::");
  }
  
  function getMatchIdentity(
    match: MatchedHealthRule,
  ): string {
    return [
      match.rule.id,
      getEvidenceIdentity(
        match.evidence,
      ),
    ].join("::");
  }
  
  function removeExactDuplicates(
    matches: MatchedHealthRule[],
  ): MatchedHealthRule[] {
    const seen = new Set<string>();
  
    const unique:
      MatchedHealthRule[] = [];
  
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
    matches: MatchedHealthRule[],
  ): MatchedHealthRule[] {
    const signalEvidenceKeys =
      new Set<string>();
  
    for (const match of matches) {
      if (
        !hasSignalRequirement(match)
      ) {
        continue;
      }
  
      signalEvidenceKeys.add(
        [
          match.rule.area,
          match.rule.direction,
          getEvidenceIdentity(
            match.evidence,
          ),
        ].join("::"),
      );
    }
  
    return matches.filter(
      (match) => {
        if (
          !hasKeywordRequirement(match)
        ) {
          return true;
        }
  
        const evidenceKey = [
          match.rule.area,
          match.rule.direction,
          getEvidenceIdentity(
            match.evidence,
          ),
        ].join("::");
  
        return (
          !signalEvidenceKeys.has(
            evidenceKey,
          )
        );
      },
    );
  }
  
  function normalizeHealthMatches(
    matches: MatchedHealthRule[],
  ): MatchedHealthRule[] {
    const uniqueMatches =
      removeExactDuplicates(matches);
  
    return (
      removeKeywordFallbackDuplicates(
        uniqueMatches,
      )
    );
  }
  
  function calculateMatchScore(
    match: MatchedHealthRule,
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
    area: HealthArea,
    matches: MatchedHealthRule[],
  ): HealthAreaScore {
    const areaMatches =
      matches.filter(
        (match) =>
          match.rule.area === area,
      );
  
    const supportMatches =
      areaMatches.filter(
        (match) =>
          match.rule.direction
            === "support",
      );
  
    const limitMatches =
      areaMatches.filter(
        (match) =>
          match.rule.direction
            === "limit",
      );
  
    const supportScore =
      supportMatches.reduce(
        (total, match) =>
          total
          + calculateMatchScore(match),
        0,
      );
  
    const limitScore =
      limitMatches.reduce(
        (total, match) =>
          total
          + calculateMatchScore(match),
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
  
  export function scoreHealthAreas(
    evidenceList: HealthEvidence[],
  ): HealthAreaScore[] {
    const matchedRules =
      matchHealthRules(
        evidenceList,
      );
  
    const normalizedMatches =
      normalizeHealthMatches(
        matchedRules,
      );
  
    return HEALTH_AREAS.map(
      (area) =>
        calculateAreaScore(
          area,
          normalizedMatches,
        ),
    );
  }