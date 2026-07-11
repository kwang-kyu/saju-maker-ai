import type { HumanDestinyProfile } from "../masterReader/types/humanDestinyProfile";
import type { HumanLifePhaseResult } from "../masterReader/types/humanLifePhase";
import type { HumanDestinyContext } from "../types/humanDestinyContext";

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