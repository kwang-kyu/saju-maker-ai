import type { HumanDestinyProfile } from "../masterReader/types/humanDestinyProfile";
import type { HumanLifePhaseResult } from "../masterReader/types/humanLifePhase";

export type HumanDestinyContext = {
  identity: HumanDestinyProfile;

  currentPhase: HumanLifePhaseResult;
};