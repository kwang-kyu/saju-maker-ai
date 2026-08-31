import {
  serializeVNextStep5BStreamingResult,
  verifyVNextStep5BStreaming,
} from "./vNextStep5BStreamingE2EVerification.js";

const result = await verifyVNextStep5BStreaming();

console.log(serializeVNextStep5BStreamingResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 5B streaming verification failed.");
}
