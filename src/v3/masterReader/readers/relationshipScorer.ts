import type {
    RelationshipArea,
    RelationshipEvidence,
  } from "../types/relationship.js";
  import {
    matchRelationshipRules,
    type MatchedRelationshipRule,
  } from "../rules/relationshipRules.js";
  
  export type RelationshipAreaScore = {
    area: RelationshipArea;
  
    supportScore: number;
  
    limitScore: number;
  
    finalScore: number;
  
    supportMatches:
      MatchedRelationshipRule[];
  
    limitMatches:
      MatchedRelationshipRule[];
  };
  
  const RELATIONSHIP_AREAS:
    RelationshipArea[] = [
      "connectionExpansion",
      "intimacyMaintenance",
      "emotionalExchange",
      "boundaryMaintenance",
      "conflictAdjustment",
      "trustRecovery",
      "partnershipCooperation",
      "spouseBonding",
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
    match: MatchedRelationshipRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher
        !== undefined
    );
  }
  
  function hasKeywordRequirement(
    match: MatchedRelationshipRule,
  ): boolean {
    return (
      match.rule.keywords !== undefined
      && match.rule.keywords.length > 0
    );
  }
  
  function getEvidenceIdentity(
    evidence: RelationshipEvidence,
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
    match: MatchedRelationshipRule,
  ): string {
    return [
      match.rule.id,
      getEvidenceIdentity(
        match.evidence,
      ),
    ].join("::");
  }
  
  function removeExactDuplicates(
    matches: MatchedRelationshipRule[],
  ): MatchedRelationshipRule[] {
    const seen = new Set<string>();
  
    const unique:
      MatchedRelationshipRule[] = [];
  
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
    matches: MatchedRelationshipRule[],
  ): MatchedRelationshipRule[] {
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
  
  function normalizeRelationshipMatches(
    matches: MatchedRelationshipRule[],
  ): MatchedRelationshipRule[] {
    const uniqueMatches =
      removeExactDuplicates(matches);
  
    return (
      removeKeywordFallbackDuplicates(
        uniqueMatches,
      )
    );
  }
  
  function calculateMatchScore(
    match: MatchedRelationshipRule,
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
    area: RelationshipArea,
    matches: MatchedRelationshipRule[],
  ): RelationshipAreaScore {
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
  
  export function scoreRelationshipAreas(
    evidenceList:
      RelationshipEvidence[],
  ): RelationshipAreaScore[] {
    const matchedRules =
      matchRelationshipRules(
        evidenceList,
      );
  
    const normalizedMatches =
      normalizeRelationshipMatches(
        matchedRules,
      );
  
    return RELATIONSHIP_AREAS.map(
      (area) =>
        calculateAreaScore(
          area,
          normalizedMatches,
        ),
    );
  }