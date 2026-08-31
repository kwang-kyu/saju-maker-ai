import {
  serializeVNextStep5C5MultiTurnUIResult,
  verifyVNextStep5C5MultiTurnUI,
} from "./vNextStep5C5MultiTurnUIVerification.js";

const result = await verifyVNextStep5C5MultiTurnUI();

console.log(serializeVNextStep5C5MultiTurnUIResult(result));

if (!result.passed) {
  process.exitCode = 1;
}
