import {
  serializeResponseActionVerificationResult,
  verifyResponseActions,
} from "./responseActionVerification.js";

const result = verifyResponseActions();

console.log(serializeResponseActionVerificationResult(result));

if (!result.passed) {
  throw new Error("Response action verification failed.");
}
