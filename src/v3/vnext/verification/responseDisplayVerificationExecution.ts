import {
  serializeResponseDisplayVerificationResult,
  verifyResponseDisplay,
} from "./responseDisplayVerification.js";

const result = verifyResponseDisplay();

console.log(serializeResponseDisplayVerificationResult(result));

if (!result.passed) {
  throw new Error("Response display verification failed.");
}
