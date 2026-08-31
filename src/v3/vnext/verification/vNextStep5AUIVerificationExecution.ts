import {
  serializeVNextStep5AUIResult,
  verifyVNextStep5AUI,
} from "./vNextStep5AUIVerification.js";

const result = await verifyVNextStep5AUI();

console.log(serializeVNextStep5AUIResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 5A UI verification failed.");
}
