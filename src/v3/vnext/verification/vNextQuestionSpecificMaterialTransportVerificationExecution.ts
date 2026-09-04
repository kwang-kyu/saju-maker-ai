import {
  serializeQuestionSpecificMaterialTransportVerificationResult,
  verifyQuestionSpecificMaterialTransport,
} from "./vNextQuestionSpecificMaterialTransportVerification.js";

const result = verifyQuestionSpecificMaterialTransport();

console.log(
  serializeQuestionSpecificMaterialTransportVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "Question-specific material transport verification failed.",
  );
}
