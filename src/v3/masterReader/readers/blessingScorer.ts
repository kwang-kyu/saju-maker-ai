import type {
    BlessingArea,
    BlessingEvidence,
  } from "../types/blessing";
  import {
    matchBlessingRules,
    type MatchedBlessingRule,
  } from "../rules/blessingRules";
  
  export type BlessingAreaScore = {
    area: BlessingArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches:
      MatchedBlessingRule[];
  
    limitMatches:
      MatchedBlessingRule[];
  };
  
  const BLESSING_AREAS:
    BlessingArea[] = [
      "opportunityReception",
      "benefactorConnection",
      "relationshipSupport",
      "resourceSupport",
      "environmentSupport",
      "crisisProtection",
      "blessingRetention",
      "blessingCirculation",
    ];
  
  function evidenceMultiplier(
    evidence: BlessingEvidence,
  ): number {
    return evidence.weight / 3;
  }
  
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
  
  function isSignalMatch(
    match: MatchedBlessingRule,
  ): boolean {
    return (
      hasSignalRequirement(match)
      && match.matchBasis.signalMatched
    );
  }
  
  function uniqueMatches(
    matches: MatchedBlessingRule[],
  ): MatchedBlessingRule[] {
    const seen = new Set<string>();
    const result:
      MatchedBlessingRule[] = [];
  
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
    matches: MatchedBlessingRule[],
  ): MatchedBlessingRule[] {
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
    matches: MatchedBlessingRule[],
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
    area: BlessingArea,
    matches: MatchedBlessingRule[],
  ): BlessingAreaScore {
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
  
  export function scoreBlessingAreas(
    evidence: BlessingEvidence[],
  ): BlessingAreaScore[] {
    const matches =
      matchBlessingRules(evidence);
  
    return BLESSING_AREAS.map(
      (area) =>
        buildAreaScore(
          area,
          matches,
        ),
    );
  }