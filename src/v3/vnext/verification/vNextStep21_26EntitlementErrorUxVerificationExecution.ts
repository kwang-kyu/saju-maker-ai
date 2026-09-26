import {
  serializeVNextStep21_26EntitlementErrorUxVerificationResult,
  verifyVNextStep21_26EntitlementErrorUx,
} from "./vNextStep21_26EntitlementErrorUxVerification.js";

const result = await verifyVNextStep21_26EntitlementErrorUx();

console.log(
  serializeVNextStep21_26EntitlementErrorUxVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "vNext STEP 21-26 entitlement error UX verification failed.",
  );
}
