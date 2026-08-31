import {
  serializeResponseValidatorVerificationResult,
  verifyResponseValidator,
} from "./responseValidatorVerification.js";

const result = verifyResponseValidator();

console.log(serializeResponseValidatorVerificationResult(result));

if (!result.passed) {
  throw new Error("Response validator verification failed.");
}
