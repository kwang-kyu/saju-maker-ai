import {
  serializeQuestionSpecificMaterialPromptPriorityVerificationResult,
  verifyQuestionSpecificMaterialPromptPriority,
} from "./vNextQuestionSpecificMaterialPromptPriorityVerification.js";

const result = verifyQuestionSpecificMaterialPromptPriority();

console.log(
  serializeQuestionSpecificMaterialPromptPriorityVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "Question-specific material prompt priority verification failed.",
  );
}
