import type { HumanDestinyProfile } from "../types/humanDestinyProfile.js";
import type { MasterReaderResult } from "../types/masterReaderResult.js";

export function buildHumanDestinyProfile(
  result: MasterReaderResult,
): HumanDestinyProfile {
  return {
    profile: result.profile,

    explanation: result.explanation,

    humanSummary: result.humanSummary,
  };
}