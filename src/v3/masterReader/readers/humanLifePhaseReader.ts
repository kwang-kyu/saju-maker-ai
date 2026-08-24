import type {
    HumanLifePhaseReaderInput,
  } from "../types/humanLifePhaseEvidence.js";
  import type {
    HumanLifePhaseResult,
  } from "../types/humanLifePhase.js";
  
  import { scoreHumanLifePhases } from "./humanLifePhaseScorer.js";
  import { selectHumanLifePhase } from "./humanLifePhaseSelector.js";
  
  export function readHumanLifePhase(
    input: HumanLifePhaseReaderInput,
  ): HumanLifePhaseResult | null {
    const scores = scoreHumanLifePhases(input);
  
    if (!scores.length) {
      return null;
    }
  
    return selectHumanLifePhase(scores);
  }