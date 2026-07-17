import type {
    CapacityConfidence,
  } from "../masterReader/types/capacity";
  import type {
    CapacityAreaSelection,
  } from "../masterReader/readers/capacitySelector";
  import type {
    MatchedCapacityRule,
  } from "../masterReader/rules/capacityRules";
  
  type CapacityConfidenceMetrics = {
    totalMatchCount: number;
  
    signalMatchCount: number;
  
    strongEvidenceCount: number;
  
    mediumEvidenceCount: number;
  
    conflictRatio: number;
  
    evidenceScore: number;
  };
  
  function hasSignalRequirement(
    match: MatchedCapacityRule,
  ): boolean {
    return (
      match.rule.signalKinds !== undefined
      || match.rule.signalMatcher !== undefined
    );
  }
  
  function countSignalMatches(
    selection: CapacityAreaSelection,
  ): number {
    const matches = [
      ...selection.supportingMatches,
      ...selection.limitingMatches,
    ];
  
    return matches.filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function countEvidenceByMinimumWeight(
    selection: CapacityAreaSelection,
    minimumWeight: number,
  ): number {
    const matches = [
      ...selection.supportingMatches,
      ...selection.limitingMatches,
    ];
  
    return matches.filter(
      (match) =>
        match.evidence.weight >= minimumWeight,
    ).length;
  }
  
  function calculateConflictRatio(
    selection: CapacityAreaSelection,
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
  
    return weakerScore / strongerScore;
  }
  
  function calculateEvidenceScore(
    selection: CapacityAreaSelection,
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
        totalMatchCount - signalMatchCount,
      );
  
    return (
      signalMatchCount * 3
      + strongEvidenceCount * 2
      + mediumEvidenceCount
      + keywordOnlyMatchCount * 0.5
    );
  }
  
  function buildConfidenceMetrics(
    selection: CapacityAreaSelection,
  ): CapacityConfidenceMetrics {
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
        calculateConflictRatio(selection),
  
      evidenceScore:
        calculateEvidenceScore(selection),
    };
  }
  
  function hasSevereConflict(
    metrics: CapacityConfidenceMetrics,
  ): boolean {
    return metrics.conflictRatio >= 0.75;
  }
  
  function hasMeaningfulConflict(
    metrics: CapacityConfidenceMetrics,
  ): boolean {
    return metrics.conflictRatio >= 0.4;
  }
  
  function hasHighQualityEvidence(
    metrics: CapacityConfidenceMetrics,
  ): boolean {
    return (
      metrics.signalMatchCount >= 2
      && metrics.strongEvidenceCount >= 1
      && metrics.evidenceScore >= 8
    );
  }
  
  function hasMediumQualityEvidence(
    metrics: CapacityConfidenceMetrics,
  ): boolean {
    return (
      metrics.signalMatchCount >= 1
      || metrics.strongEvidenceCount >= 1
      || metrics.evidenceScore >= 4
    );
  }
  
  export function buildCapacityConfidence(
    selection: CapacityAreaSelection,
  ): CapacityConfidence {
    if (
      selection.status === "insufficient"
      || selection.level === null
    ) {
      return "low";
    }
  
    const metrics =
      buildConfidenceMetrics(selection);
  
    if (
      hasHighQualityEvidence(metrics)
      && !hasMeaningfulConflict(metrics)
    ) {
      return "high";
    }
  
    if (
      hasMediumQualityEvidence(metrics)
      && !hasSevereConflict(metrics)
    ) {
      return "medium";
    }
  
    return "low";
  }