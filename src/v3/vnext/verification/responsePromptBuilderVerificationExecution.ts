import {
  serializeResponsePromptBuilderVerificationResult,
  verifyResponsePromptBuilder,
} from "./responsePromptBuilderVerification.js";

const result = verifyResponsePromptBuilder();

console.log(serializeResponsePromptBuilderVerificationResult(result));

if (!result.passed) {
  throw new Error("Response prompt builder verification failed.");
}
