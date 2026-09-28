/**
 * STEP 48-1 Summary DOCX verification execution entry.
 */

import {
  serializeVNextReportSummaryDocxResult,
  verifyVNextReportSummaryDocx,
} from "./vNextReportSummaryDocxVerification.js";

async function main(): Promise<void> {
  const result = await verifyVNextReportSummaryDocx();
  console.log(serializeVNextReportSummaryDocxResult(result));

  if (!result.passed) {
    throw new Error("STEP 48-1 Summary DOCX verification failed.");
  }
}

void main();
