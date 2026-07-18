import type {
    RelationshipConfidence,
  } from "../masterReader/types/relationship";
  import type {
    RelationshipAreaSelection,
  } from "../masterReader/readers/relationshipSelector";
  import type {
    MatchedRelationshipRule,
  } from "../masterReader/rules/relationshipRules";
  
  type RelationshipConfidenceMetrics = {
    totalMatchCount: number;
  
    signalMatchCount: number;
  
    strongEvidenceCount: number;
  
    mediumEvidenceCount: number;
  
    conflictRatio: number;
  
    evidenceScore: number;
  };
  
  function hasSignalRequirement(
    match: MatchedRelationshipRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher
        !== undefined
    );
  }
  
  function collectMatches(
    selection:
      RelationshipAreaSelection,
  ): MatchedRelationshipRule[] {
    return [
      ...selection.supportingMatches,
      ...selection.limitingMatches,
    ];
  }
  
  function countSignalMatches(
    selection:
      RelationshipAreaSelection,
  ): number {
    return collectMatches(
      selection,
    ).filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function countEvidenceByMinimumWeight(
    selection:
      RelationshipAreaSelection,
    minimumWeight: number,
  ): number {
    return collectMatches(
      selection,
    ).filter(
      (match) =>
        match.evidence.weight
          >= minimumWeight,
    ).length;
  }
  
  function calculateConflictRatio(
    selection:
      RelationshipAreaSelection,
  ): number {
    const strongerScore = Math.max(
      selection.supportScore,
      selection.limitScore,
    );
  
    const weakerScore = Math.min(
      selection.supportScore,
      selection.limitScore,
    );
  
    if (strongerScore <= 0) {
      return 0;
    }
  
    return (
      weakerScore / strongerScore
    );
  }
  
  function calculateEvidenceScore(
    selection:
      RelationshipAreaSelection,
  ): number {
    const signalMatchCount =
      countSignalMatches(selection);
  
    const strongEvidenceCount =
      countEvidenceByMinimumWeight(
        selection,
        3,
      );
  
    const mediumOrStrongEvidenceCount =
      countEvidenceByMinimumWeight(
        selection,
        2,
      );
  
    const mediumEvidenceCount =
      Math.max(
        0,
        mediumOrStrongEvidenceCount
          - strongEvidenceCount,
      );
  
    const totalMatchCount =
      selection.supportingMatches.length
      + selection.limitingMatches.length;
  
    const keywordOnlyMatchCount =
      Math.max(
        0,
        totalMatchCount
          - signalMatchCount,
      );
  
    return (
      signalMatchCount * 3
      + strongEvidenceCount * 2
      + mediumEvidenceCount
      + keywordOnlyMatchCount * 0.5
    );
  }
  
  function buildConfidenceMetrics(
    selection:
      RelationshipAreaSelection,
  ): RelationshipConfidenceMetrics {
    const totalMatchCount =
      selection.supportingMatches.length
      + selection.limitingMatches.length;
  
    const signalMatchCount =
      countSignalMatches(selection);
  
    const strongEvidenceCount =
      countEvidenceByMinimumWeight(
        selection,
        3,
      );
  
    const mediumOrStrongEvidenceCount =
      countEvidenceByMinimumWeight(
        selection,
        2,
      );
  
    const mediumEvidenceCount =
      Math.max(
        0,
        mediumOrStrongEvidenceCount
          - strongEvidenceCount,
      );
  
    return {
      totalMatchCount,
  
      signalMatchCount,
  
      strongEvidenceCount,
  
      mediumEvidenceCount,
  
      conflictRatio:
        calculateConflictRatio(
          selection,
        ),
  
      evidenceScore:
        calculateEvidenceScore(
          selection,
        ),
    };
  }
  
  function hasSevereConflict(
    metrics:
      RelationshipConfidenceMetrics,
  ): boolean {
    return (
      metrics.conflictRatio >= 0.75
    );
  }
  
  function hasMeaningfulConflict(
    metrics:
      RelationshipConfidenceMetrics,
  ): boolean {
    return (
      metrics.conflictRatio >= 0.4
    );
  }
  
  function hasHighQualityEvidence(
    metrics:
      RelationshipConfidenceMetrics,
  ): boolean {
    return (
      metrics.signalMatchCount >= 2
      && metrics.strongEvidenceCount
        >= 1
      && metrics.evidenceScore >= 8
    );
  }
  
  function hasMediumQualityEvidence(
    metrics:
      RelationshipConfidenceMetrics,
  ): boolean {
    return (
      metrics.signalMatchCount >= 1
      || metrics.strongEvidenceCount
        >= 1
      || metrics.evidenceScore >= 4
    );
  }
  
  export function buildRelationshipConfidence(
    selection:
      RelationshipAreaSelection,
  ): RelationshipConfidence {
    if (
      selection.status
        === "insufficient"
      || selection.level === null
    ) {
      return "low";
    }
  
    const metrics =
      buildConfidenceMetrics(
        selection,
      );
  
    if (
      hasHighQualityEvidence(metrics)
      && !hasMeaningfulConflict(
        metrics,
      )
    ) {
      return "high";
    }
  
    if (
      hasMediumQualityEvidence(
        metrics,
      )
      && !hasSevereConflict(metrics)
    ) {
      return "medium";
    }
  
    return "low";
  }