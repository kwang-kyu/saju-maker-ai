import {
  serializePromptBudgetVerificationResult,
  verifyPromptBudgets,
} from "./promptBudgetVerification.js";

const result = verifyPromptBudgets();

console.log(serializePromptBudgetVerificationResult(result));

if (!result.passed) {
  throw new Error("Prompt budget verification failed.");
}
