import {
  serializeResponseContextVerificationResult,
  verifyResponseContexts,
} from "./responseContextVerification.js";

const result = verifyResponseContexts();

console.log(serializeResponseContextVerificationResult(result));

if (!result.passed) {
  throw new Error("Response context verification failed.");
}
