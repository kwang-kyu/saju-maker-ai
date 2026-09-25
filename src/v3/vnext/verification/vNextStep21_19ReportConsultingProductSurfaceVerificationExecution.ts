/**
 *   npx.cmd tsx src/v3/vnext/verification/vNextStep21_19ReportConsultingProductSurfaceVerificationExecution.ts
 */

import {
  serializeVNextStep21_19ProductSurfaceResult,
  verifyVNextStep21_19ReportConsultingProductSurface,
} from "./vNextStep21_19ReportConsultingProductSurfaceVerification.js";

const result =
  await verifyVNextStep21_19ReportConsultingProductSurface();

console.log(
  serializeVNextStep21_19ProductSurfaceResult(result),
);

if (!result.passed) {
  throw new Error(
    "vNext STEP 21-19 Report/Consulting product surface verification failed.",
  );
}
