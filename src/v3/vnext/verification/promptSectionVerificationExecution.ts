import {
  serializePromptSectionVerificationResult,
  verifyPromptSections,
} from "./promptSectionVerification.js";

const result = verifyPromptSections();

console.log(serializePromptSectionVerificationResult(result));

if (!result.passed) {
  throw new Error("Prompt section verification failed.");
}
