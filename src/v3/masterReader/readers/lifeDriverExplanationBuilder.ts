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

  return {
    title: definition.label,

    summary: definition.description,

    strengths: [...definition.activationKeywords],

    cautions: [...definition.riskKeywords],

    evidence: judgement.evidence.map(
      (item) => item.description,
    ),
  };
}