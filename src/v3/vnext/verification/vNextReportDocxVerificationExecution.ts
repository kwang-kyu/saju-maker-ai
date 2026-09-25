/**
 *   npx.cmd tsx src/v3/vnext/verification/vNextReportDocxVerificationExecution.ts
 */

import {
  serializeVNextReportDocxResult,
  verifyVNextReportDocx,
} from "./vNextReportDocxVerification.js";

const result = await verifyVNextReportDocx();

console.log(serializeVNextReportDocxResult(result));

if (!result.passed) {
  throw new Error("vNext STEP 21-3 Report DOCX verification failed.");
}
