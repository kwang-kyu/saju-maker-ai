import type { MasterProfile } from "./masterProfile.js";
import type { MasterProfileExplanation } from "../readers/masterProfileExplanationBuilder.js";
import type { MasterHumanSummary } from "../readers/masterHumanSummaryBuilder.js";

export type HumanDestinyProfile = {
  profile: MasterProfile;

  explanation: MasterProfileExplanation;

  humanSummary: MasterHumanSummary;
};