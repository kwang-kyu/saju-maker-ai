import type {
    HumanLifePhaseReaderInput,
  } from "../types/humanLifePhaseEvidence";
  import type {
    HumanLifePhaseResult,
  } from "../types/humanLifePhase";
  
  import { scoreHumanLifePhases } from "./humanLifePhaseScorer";
  import { selectHumanLifePhase } from "./humanLifePhaseSelector";
  
  export function readHumanLifePhase(
    input: HumanLifePhaseReaderInput,
  ): HumanLifePhaseResult | null {
    const scores = scoreHumanLifePhases(input);
  
    if (!scores.length) {
      return null;
    }
  
    return selectHumanLifePhase(scores);
  }