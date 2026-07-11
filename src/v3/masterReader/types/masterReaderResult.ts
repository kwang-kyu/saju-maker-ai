import type { MasterProfile } from "./masterProfile";
import type { MasterProfileExplanation } from "../readers/masterProfileExplanationBuilder";

export type MasterReaderResult = {
  profile: MasterProfile;

  explanation: MasterProfileExplanation;
};