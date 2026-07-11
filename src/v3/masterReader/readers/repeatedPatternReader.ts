import {
    getRepeatedPatternDefinition,
  } from "../constants/repeatedPatternDefinitions";
  import type {
    PatternConfidence,
    PatternEvidence,
    RepeatedPatternJudgement,
    RepeatedPatternResult,
  } from "../types/repeatedPattern";
  import {
    scoreRepeatedPatterns,
    type RepeatedPatternScore,
  } from "./repeatedPatternScorer";
  import {
    selectRepeatedPatterns,
    type RepeatedPatternSelectionStatus,
  } from "./repeatedPatternSelector";
  
  function getConfidence(
    status: RepeatedPatternSelectionStatus,
    score: RepeatedPatternScore,
  ): PatternConfidence {
    const independentSources = new Set(
      score.matches.map((match) => match.evidence.source),
    ).size;
  
    if (
      status === "clear" &&
      independentSources >= 3 &&
      score.score >= 8
    ) {
      return "high";
    }
  
    if (independentSources >= 2 && score.score >= 4) {
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
      description: match.rule.reason,
      weight: match.rule.weight,
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