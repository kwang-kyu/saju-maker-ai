import {
    getSurvivalStyleDefinition,
  } from "../constants/survivalStyleDefinitions";
  import type {
    SurvivalStyleJudgement,
    SurvivalStyleResult,
  } from "../types/survivalStyle";
  
  export type SurvivalStyleExplanation = {
    title: string;
    summary: string;
    crisisBehaviors: string[];
    recoveryMethods: string[];
    prohibitedActions: string[];
    evidence: string[];
  };
  
  function buildSingleSurvivalExplanation(
    judgement: SurvivalStyleJudgement,
  ): SurvivalStyleExplanation {
    const definition = getSurvivalStyleDefinition(judgement.style);
  
    return {
      title: definition.label,
  
      summary: definition.description,
  
      crisisBehaviors: [...definition.crisisBehaviors],
  
      recoveryMethods: [...definition.recoveryMethods],
  
      prohibitedActions: [...definition.prohibitedActions],
  
      evidence: judgement.evidence.map(
        (item) => item.description,
      ),
    };
  }
  
  export type SurvivalStyleResultExplanation = {
    primary: SurvivalStyleExplanation;
    secondary: SurvivalStyleExplanation | null;
    crisisBehaviors: string[];
    recoveryMethods: string[];
    prohibitedActions: string[];
  };
  
  export function buildSurvivalStyleExplanation(
    result: SurvivalStyleResult,
  ): SurvivalStyleResultExplanation {
    return {
      primary: buildSingleSurvivalExplanation(result.primary),
  
      secondary: result.secondary
        ? buildSingleSurvivalExplanation(result.secondary)
        : null,
  
      crisisBehaviors: [...result.crisisBehavior],
  
      recoveryMethods: [...result.recoveryMethods],
  
      prohibitedActions: [...result.prohibitedActions],
    };
  }