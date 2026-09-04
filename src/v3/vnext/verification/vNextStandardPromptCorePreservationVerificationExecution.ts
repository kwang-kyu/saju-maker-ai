import {
  serializeStandardPromptCorePreservationResult,
  verifyStandardPromptCorePreservation,
} from "./vNextStandardPromptCorePreservationVerification.js";

const result = verifyStandardPromptCorePreservation();

console.log(serializeStandardPromptCorePreservationResult(result));

if (!result.passed) {
  throw new Error("Standard prompt core preservation verification failed.");
}
