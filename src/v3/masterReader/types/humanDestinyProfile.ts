import type { MasterProfile } from "./masterProfile";
import type { MasterProfileExplanation } from "../readers/masterProfileExplanationBuilder";
import type { MasterHumanSummary } from "../readers/masterHumanSummaryBuilder";

export type HumanDestinyProfile = {
  profile: MasterProfile;

  explanation: MasterProfileExplanation;

  humanSummary: MasterHumanSummary;
};