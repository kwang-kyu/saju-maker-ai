import {
  serializeVNextAnalysisProgressVerificationResult,
  verifyVNextAnalysisProgress,
} from "./vNextAnalysisProgressVerification.js";

const result = verifyVNextAnalysisProgress();

console.log(serializeVNextAnalysisProgressVerificationResult(result));

if (!result.passed) {
  throw new Error("vNext analysis progress verification failed.");
}
