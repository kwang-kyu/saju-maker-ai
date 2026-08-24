import {
    getSurvivalStyleDefinition,
  } from "../constants/survivalStyleDefinitions.js";
  import type {
    SurvivalConfidence,
    SurvivalEvidence,
    SurvivalStyleJudgement,
    SurvivalStyleResult,
  } from "../types/survivalStyle.js";
  import {
    scoreSurvivalStyles,
    type SurvivalStyleScore,
  } from "./survivalStyleScorer.js";
  import {
    selectSurvivalStyles,
    type SurvivalStyleSelectionStatus,
  } from "./survivalStyleSelector.js";
  
  function getConfidence(
    status: SurvivalStyleSelectionStatus,
    score: SurvivalStyleScore,
  ): SurvivalConfidence {
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
    score: SurvivalStyleScore,
    status: SurvivalStyleSelectionStatus,
  ): SurvivalStyleJudgement {
    const evidence: SurvivalEvidence[] = score.matches.map((match) => ({
      source: match.evidence.source,
      description: match.rule.reason,
      weight: match.rule.weight,
    }));
  
    return {
      style: score.style,
      evidence,
      counterEvidence: [],
      confidence: getConfidence(status, score),
      exceptionConditions: [],
    };
  }
  
  export function readSurvivalStyle(
    evidenceList: SurvivalEvidence[],
  ): SurvivalStyleResult | null {
    const scores = scoreSurvivalStyles(evidenceList);
    const selection = selectSurvivalStyles(scores);
  
    if (!selection.primary) {
      return null;
    }
  
    const primaryDefinition = getSurvivalStyleDefinition(
      selection.primary.style,
    );
  
    const secondaryDefinition = selection.secondary
      ? getSurvivalStyleDefinition(selection.secondary.style)
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
  
      crisisBehavior: [
        ...primaryDefinition.crisisBehaviors,
        ...(secondaryDefinition?.crisisBehaviors ?? []),
      ],
  
      recoveryMethods: [
        ...primaryDefinition.recoveryMethods,
        ...(secondaryDefinition?.recoveryMethods ?? []),
      ],
  
      prohibitedActions: [
        ...primaryDefinition.prohibitedActions,
        ...(secondaryDefinition?.prohibitedActions ?? []),
      ],
  
      suppressed: [],
      conflicting: [],
    };
  }