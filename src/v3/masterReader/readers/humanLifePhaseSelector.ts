import type { HumanLifePhaseResult } from "../types/humanLifePhase";
import { getHumanLifePhaseDefinition } from "../constants/humanLifePhaseDefinitions";
import type { HumanLifePhaseScore } from "./humanLifePhaseScorer";

export function selectHumanLifePhase(
  scores: HumanLifePhaseScore[],
): HumanLifePhaseResult | null {
  if (!scores.length) {
    return null;
  }

  const best = scores[0];

  if (best.finalScore <= 0 || best.supportScore <= 0) {
    return null;
  }

  const definition = getHumanLifePhaseDefinition(
    best.phase,
  );

  return {
    phase: best.phase,

    title: definition.title,

    description: definition.description,

    focusAreas: [...definition.focusAreas],

    avoidAreas: [...definition.avoidAreas],
  };
}