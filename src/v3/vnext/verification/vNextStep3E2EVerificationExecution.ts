import {
  serializeVNextStep3E2EResult,
  verifyVNextStep3E2E,
} from "./vNextStep3E2EVerification.js";

const e2eResult = verifyVNextStep3E2E();

console.log(serializeVNextStep3E2EResult(e2eResult));

if (!e2eResult.passed) {
  throw new Error("vNext STEP 3 E2E verification failed.");
}
