import { getLifeDriverDefinition } from "../constants/lifeDriverDefinitions";
import type { LifeDriverJudgement } from "../types/lifeDriver";

export type LifeDriverExplanation = {
  title: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  evidence: string[];
};

export function buildLifeDriverExplanation(
  judgement: LifeDriverJudgement,
): LifeDriverExplanation {
  const definition = getLifeDriverDefinition(judgement.driver);
  const interpretation =
  judgement.interpretation;
  return {
    title: definition.label,

    summary: interpretation
    ? `${definition.description} ${interpretation.operatingStyle}`
    : definition.description,

    strengths: interpretation
    ? [
        interpretation.strengthExpression,
        ...interpretation.suitableConditions,
      ]
    : [...definition.activationKeywords],

    cautions: interpretation
    ? [interpretation.riskPattern]
    : [...definition.riskKeywords],

    evidence: judgement.evidence.map(
      (item) => item.description,
    ),
  };
}