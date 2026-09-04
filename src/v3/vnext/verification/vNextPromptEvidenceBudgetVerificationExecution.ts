import {
  serializePromptEvidenceBudgetVerificationResult,
  verifyPromptEvidenceBudget,
} from "./vNextPromptEvidenceBudgetVerification.js";

const result = verifyPromptEvidenceBudget();

console.log(serializePromptEvidenceBudgetVerificationResult(result));

if (!result.passed) {
  throw new Error("Prompt evidence budget verification failed.");
}
