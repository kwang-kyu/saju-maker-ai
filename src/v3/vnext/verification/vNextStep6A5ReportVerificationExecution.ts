import {
  serializeVNextStep6A5ReportResult,
  verifyVNextStep6A5Report,
} from "./vNextStep6A5ReportVerification.js";

const result = await verifyVNextStep6A5Report();

console.log(serializeVNextStep6A5ReportResult(result));

process.exit(result.passed ? 0 : 1);
