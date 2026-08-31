import {
  serializeVNextStep4BPromptE2EResult,
  verifyVNextStep4BPromptE2E,
} from "./vNextStep4BPromptE2EVerification.js";

const result = verifyVNextStep4BPromptE2E();

console.log(serializeVNextStep4BPromptE2EResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 4B prompt E2E verification failed.");
}
