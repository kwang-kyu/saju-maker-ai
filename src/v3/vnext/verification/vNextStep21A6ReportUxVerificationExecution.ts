/**
 *   npx.cmd tsx src/v3/vnext/verification/vNextStep21A6ReportUxVerificationExecution.ts
 */

import {
  serializeVNextStep21A6ReportUxResult,
  verifyVNextStep21A6ReportUx,
} from "./vNextStep21A6ReportUxVerification.js";

const result = await verifyVNextStep21A6ReportUx();

console.log(serializeVNextStep21A6ReportUxResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 21-6 Report UX verification failed.");
}
