import {
    getRepeatedPatternDefinition,
  } from "../constants/repeatedPatternDefinitions.js";
  import type {
    PatternConfidence,
    PatternEvidence,
    RepeatedPatternJudgement,
    RepeatedPatternResult,
  } from "../types/repeatedPattern.js";
  import {
    scoreRepeatedPatterns,
    type RepeatedPatternScore,
  } from "./repeatedPatternScorer.js";
  import {
    selectRepeatedPatterns,
    type RepeatedPatternSelectionStatus,
  } from "./repeatedPatternSelector.js";
  
  function getConfidence(
    status: RepeatedPatternSelectionStatus,
    score: RepeatedPatternScore,
  ): PatternConfidence {
    const independentEvidenceCount = new Set(
      score.matches.map(
        (match) =>
          `${match.evidence.source}:${match.evidence.description}`,
      ),
    ).size;
  
    if (
      status === "clear" &&
      independentEvidenceCount >= 2 &&
      score.score >= 8
    ) {
      return "high";
    }
  
    if (
      independentEvidenceCount >= 1 &&
      score.score >= 4
    ) {
      return "medium";
    }
  
    return "low";
  }
  
  function buildJudgement(
    score: RepeatedPatternScore,
    status: RepeatedPatternSelectionStatus,
  ): RepeatedPatternJudgement {
    const evidence: PatternEvidence[] = score.matches.map((match) => ({
      source: match.evidence.source,
      description: match.evidence.description,
      weight: match.evidence.weight,
    }));
  
    return {
      pattern: score.pattern,
      evidence,
      counterEvidence: [],
      confidence: getConfidence(status, score),
      exceptionConditions: [],
    };
  }
  
  export function readRepeatedPattern(
    evidenceList: PatternEvidence[],
  ): RepeatedPatternResult | null {
    const scores = scoreRepeatedPatterns(evidenceList);
    const selection = selectRepeatedPatterns(scores);
  
    if (!selection.primary) {
      return null;
    }
  
    const primaryDefinition = getRepeatedPatternDefinition(
      selection.primary.pattern,
    );
  
    const secondaryDefinition = selection.secondary
      ? getRepeatedPatternDefinition(selection.secondary.pattern)
      : null;
  
    return {
      primary: buildJudgement(
        selection.primary,
        selection.status,
      ),
  
      secondary: selection.secondary
        ? buildJudgement(
            selection.secondary,
            selection.status,
          )
        : null,
  
      repeatedBehaviors: [
        ...primaryDefinition.repeatedBehaviors,
        ...(secondaryDefinition?.repeatedBehaviors ?? []),
      ],
  
      strengths: [
        ...primaryDefinition.strengths,
        ...(secondaryDefinition?.strengths ?? []),
      ],
  
      risks: [
        ...primaryDefinition.risks,
        ...(secondaryDefinition?.risks ?? []),
      ],
  
      suppressed: [],
      conflicting: [],
    };
  }