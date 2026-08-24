import {
    getRepeatedPatternDefinition,
  } from "../constants/repeatedPatternDefinitions.js";
  import type {
    RepeatedPatternJudgement,
    RepeatedPatternResult,
  } from "../types/repeatedPattern.js";
  
  export type RepeatedPatternExplanation = {
    title: string;
    summary: string;
    repeatedBehaviors: string[];
    strengths: string[];
    risks: string[];
    evidence: string[];
  };
  
  function buildSingleRepeatedPatternExplanation(
    judgement: RepeatedPatternJudgement,
  ): RepeatedPatternExplanation {
    const definition = getRepeatedPatternDefinition(
      judgement.pattern,
    );
  
    return {
      title: definition.label,
  
      summary: definition.description,
  
      repeatedBehaviors: [
        ...definition.repeatedBehaviors,
      ],
  
      strengths: [...definition.strengths],
  
      risks: [...definition.risks],
  
      evidence: judgement.evidence.map(
        (item) => item.description,
      ),
    };
  }
  
  export type RepeatedPatternResultExplanation = {
    primary: RepeatedPatternExplanation;
    secondary: RepeatedPatternExplanation | null;
    repeatedBehaviors: string[];
    strengths: string[];
    risks: string[];
  };
  
  export function buildRepeatedPatternExplanation(
    result: RepeatedPatternResult,
  ): RepeatedPatternResultExplanation {
    return {
      primary: buildSingleRepeatedPatternExplanation(
        result.primary,
      ),
  
      secondary: result.secondary
        ? buildSingleRepeatedPatternExplanation(
            result.secondary,
          )
        : null,
  
      repeatedBehaviors: [...result.repeatedBehaviors],
  
      strengths: [...result.strengths],
  
      risks: [...result.risks],
    };
  }