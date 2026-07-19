import type {
    DestinyArea,
    DestinyEvidence,
  } from "../types/destiny";
  import {
    matchDestinyRules,
    type MatchedDestinyRule,
  } from "../rules/destinyRules";
  
  export type DestinyAreaScore = {
    area: DestinyArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches:
      MatchedDestinyRule[];
  
    limitMatches:
      MatchedDestinyRule[];
  };
  
  const DESTINY_AREAS:
    DestinyArea[] = [
      "lifeDirection",
      "coreLifeTask",
      "strengthFulfillment",
      "growthPath",
      "choiceAlignment",
      "changeIntegration",
      "contributionPattern",
      "longTermCoherence",
    ];
  
  function evidenceMultiplier(
    evidence: DestinyEvidence,
  ): number {
    return evidence.weight / 3;
  }
  
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
  
  function isSignalMatch(
    match: MatchedDestinyRule,
  ): boolean {
    return (
      hasSignalRequirement(match)
      && match.matchBasis.signalMatched
    );
  }
  
  function uniqueMatches(
    matches: MatchedDestinyRule[],
  ): MatchedDestinyRule[] {
    const seen = new Set<string>();
    const result:
      MatchedDestinyRule[] = [];
  
    for (const match of matches) {
      const identity = [
        match.rule.id,
        match.evidence.source,
        match.evidence.signal
          ?.kind
          ?? "no-signal",
        match.evidence.description,
        match.evidence.weight.toString(),
      ].join("::");
  
      if (seen.has(identity)) {
        continue;
      }
  
      seen.add(identity);
      result.push(match);
    }
  
    return result;
  }
  
  function preferSignalMatches(
    matches: MatchedDestinyRule[],
  ): MatchedDestinyRule[] {
    const signalMatches =
      matches.filter(isSignalMatch);
  
    if (signalMatches.length === 0) {
      return matches;
    }
  
    const signalEvidence =
      new Set(
        signalMatches.map(
          (match) =>
            match.evidence,
        ),
      );
  
    return matches.filter(
      (match) =>
        isSignalMatch(match)
        || !signalEvidence.has(
          match.evidence,
        ),
    );
  }
  
  function calculateScore(
    matches: MatchedDestinyRule[],
  ): number {
    return matches.reduce(
      (total, match) =>
        total
        + match.rule.score
          * evidenceMultiplier(
            match.evidence,
          ),
      0,
    );
  }
  
  function buildAreaScore(
    area: DestinyArea,
    matches: MatchedDestinyRule[],
  ): DestinyAreaScore {
    const areaMatches =
      preferSignalMatches(
        uniqueMatches(
          matches.filter(
            (match) =>
              match.rule.area === area,
          ),
        ),
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
      calculateScore(
        supportMatches,
      );
  
    const limitScore =
      calculateScore(
        limitMatches,
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
  
  export function scoreDestinyAreas(
    evidence: DestinyEvidence[],
  ): DestinyAreaScore[] {
    const matches =
      matchDestinyRules(evidence);
  
    return DESTINY_AREAS.map(
      (area) =>
        buildAreaScore(
          area,
          matches,
        ),
    );
  }