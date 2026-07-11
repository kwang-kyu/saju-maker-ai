import type { HumanDestinyProfile } from "../types/humanDestinyProfile";
import type { MasterReaderResult } from "../types/masterReaderResult";

export function buildHumanDestinyProfile(
  result: MasterReaderResult,
): HumanDestinyProfile {
  return {
    profile: result.profile,

    explanation: result.explanation,

    humanSummary: result.humanSummary,
  };
}