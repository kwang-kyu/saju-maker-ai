/**
 * STEP 49-3 Detail DOCX verification execution entry.
 *
 *   npx.cmd tsx src/v3/vnext/verification/vNextReportDetailDocxVerificationExecution.ts
 */

import {
  serializeVNextReportDetailDocxResult,
  verifyVNextReportDetailDocx,
} from "./vNextReportDetailDocxVerification.js";

async function main(): Promise<void> {
  const result = await verifyVNextReportDetailDocx();
  console.log(serializeVNextReportDetailDocxResult(result));

  if (!result.passed) {
    throw new Error("STEP 49-3 Detail DOCX verification failed.");
  }
}

void main();
