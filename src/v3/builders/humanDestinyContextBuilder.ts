import type { HumanDestinyProfile } from "../masterReader/types/humanDestinyProfile.js";
import type { HumanLifePhaseResult } from "../masterReader/types/humanLifePhase.js";
import type { HumanDestinyContext } from "../types/humanDestinyContext.js";

export type HumanDestinyContextBuilderInput = {
  identity: HumanDestinyProfile;

  currentPhase: HumanLifePhaseResult;
};

export function buildHumanDestinyContext(
  input: HumanDestinyContextBuilderInput,
): HumanDestinyContext {
  return {
    identity: input.identity,

    currentPhase: input.currentPhase,
  };
}