import {
  serializeVNextStep4AE2EResult,
  verifyVNextStep4AE2E,
} from "./vNextStep4AE2EVerification.js";

const e2eResult = verifyVNextStep4AE2E();

console.log(serializeVNextStep4AE2EResult(e2eResult));

if (!e2eResult.passed) {
  throw new Error("vNext STEP 4A E2E verification failed.");
}
