import {
  serializeQuestionSpecificMaterialPriorityVerificationResult,
  verifyQuestionSpecificMaterialPriority,
} from "./vNextQuestionSpecificMaterialPriorityVerification.js";

const result = verifyQuestionSpecificMaterialPriority();

console.log(
  serializeQuestionSpecificMaterialPriorityVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "Question-specific material priority verification failed.",
  );
}
