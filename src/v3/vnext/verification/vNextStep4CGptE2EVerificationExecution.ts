import {
  serializeVNextStep4CGptE2EResult,
  verifyVNextStep4CGptE2E,
} from "./vNextStep4CGptE2EVerification.js";

const result = await verifyVNextStep4CGptE2E();

console.log(serializeVNextStep4CGptE2EResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 4C GPT E2E verification failed.");
}
