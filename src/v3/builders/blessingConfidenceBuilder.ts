import type {
    BlessingConfidence,
  } from "../masterReader/types/blessing";
  import type {
    BlessingAreaSelection,
  } from "../masterReader/readers/blessingSelector";
  import type {
    MatchedBlessingRule,
  } from "../masterReader/rules/blessingRules";
  
  type BlessingConfidenceMetrics = {
    totalMatchCount: number;
  
    signalMatchCount: number;
  
    strongEvidenceCount: number;
  
    mediumEvidenceCount: number;
  
    conflictRatio: number;
  
    evidenceScore: number;
  };
  
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
  
  function getMatches(
    selection: BlessingAreaSelection,
  ): MatchedBlessingRule[] {
    return [
      ...selection.supportingMatches,
      ...selection.limitingMatches,
    ];
  }
  
  function countSignalMatches(
    selection: BlessingAreaSelection,
  ): number {
    return getMatches(selection).filter(
      (match) =>
        hasSignalRequirement(match)
        && match.matchBasis.signalMatched,
    ).length;
  }
  
  function countEvidenceByMinimumWeight(
    selection: BlessingAreaSelection,
    minimumWeight: number,
  ): number {
    return getMatches(selection).filter(
      (match) =>
        match.evidence.weight
          >= minimumWeight,
    ).length;
  }
  
  function calculateConflictRatio(
    selection: BlessingAreaSelection,
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
    selection: BlessingAreaSelection,
  ): number {
    const matches =
      getMatches(selection);
  
    const signalMatchCount =
      countSignalMatches(selection);
  
    const strongEvidenceCount =
      countEvidenceByMinimumWeight(
        selection,
        3,
      );
  
    const mediumOrStrongCount =
      countEvidenceByMinimumWeight(
        selection,
        2,
      );
  
    const mediumEvidenceCount =
      Math.max(
        0,
        mediumOrStrongCount
          - strongEvidenceCount,
      );
  
    const keywordOnlyMatchCount =
      Math.max(
        0,
        matches.length
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
    selection: BlessingAreaSelection,
  ): BlessingConfidenceMetrics {
    const matches =
      getMatches(selection);
  
    const strongEvidenceCount =
      countEvidenceByMinimumWeight(
        selection,
        3,
      );
  
    const mediumOrStrongCount =
      countEvidenceByMinimumWeight(
        selection,
        2,
      );
  
    return {
      totalMatchCount:
        matches.length,
  
      signalMatchCount:
        countSignalMatches(
          selection,
        ),
  
      strongEvidenceCount,
  
      mediumEvidenceCount:
        Math.max(
          0,
          mediumOrStrongCount
            - strongEvidenceCount,
        ),
  
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
    metrics: BlessingConfidenceMetrics,
  ): boolean {
    return metrics.conflictRatio >= 0.75;
  }
  
  function hasMeaningfulConflict(
    metrics: BlessingConfidenceMetrics,
  ): boolean {
    return metrics.conflictRatio >= 0.4;
  }
  
  function hasHighQualityEvidence(
    metrics: BlessingConfidenceMetrics,
  ): boolean {
    return (
      metrics.signalMatchCount >= 2
      && metrics.strongEvidenceCount >= 1
      && metrics.evidenceScore >= 8
    );
  }
  
  function hasMediumQualityEvidence(
    metrics: BlessingConfidenceMetrics,
  ): boolean {
    return (
      metrics.signalMatchCount >= 1
      || metrics.strongEvidenceCount >= 1
      || metrics.mediumEvidenceCount >= 2
      || metrics.evidenceScore >= 4
    );
  }
  
  export function buildBlessingConfidence(
    selection: BlessingAreaSelection,
  ): BlessingConfidence {
    if (
      selection.status === "insufficient"
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