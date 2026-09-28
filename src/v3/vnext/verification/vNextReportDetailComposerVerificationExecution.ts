/**
 * STEP 49-2 Detail Composer verification execution entry.
 *
 *   npx.cmd tsx src/v3/vnext/verification/vNextReportDetailComposerVerificationExecution.ts
 */

import {
  serializeVNextReportDetailComposerResult,
  verifyVNextReportDetailComposer,
} from "./vNextReportDetailComposerVerification.js";

async function main(): Promise<void> {
  const result = await verifyVNextReportDetailComposer();
  console.log(serializeVNextReportDetailComposerResult(result));

  if (!result.passed) {
    throw new Error("STEP 49-2 Detail Composer verification failed.");
  }
}

void main();
