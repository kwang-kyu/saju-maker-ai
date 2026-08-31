import {
  serializeResponseStreamingVerificationResult,
  verifyResponseStreaming,
} from "./responseStreamingVerification.js";

const result = await verifyResponseStreaming();

console.log(serializeResponseStreamingVerificationResult(result));

if (!result.passed) {
  throw new Error("Response streaming verification failed.");
}
