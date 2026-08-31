import {
  serializeResponseFallbackVerificationResult,
  verifyResponseFallback,
} from "./responseFallbackVerification.js";

const result = verifyResponseFallback();

console.log(serializeResponseFallbackVerificationResult(result));

if (!result.passed) {
  throw new Error("Response fallback verification failed.");
}
