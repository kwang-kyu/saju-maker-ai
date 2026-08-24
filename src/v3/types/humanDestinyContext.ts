import type { HumanDestinyProfile } from "../masterReader/types/humanDestinyProfile.js";
import type { HumanLifePhaseResult } from "../masterReader/types/humanLifePhase.js";

export type HumanDestinyContext = {
  identity: HumanDestinyProfile;

  currentPhase: HumanLifePhaseResult;
};