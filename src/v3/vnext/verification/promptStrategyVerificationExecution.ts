import {
  serializePromptStrategyVerificationResult,
  verifyPromptStrategies,
} from "./promptStrategyVerification.js";

const result = verifyPromptStrategies();

console.log(serializePromptStrategyVerificationResult(result));

if (!result.passed) {
  throw new Error("Prompt strategy verification failed.");
}
