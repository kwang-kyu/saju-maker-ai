import {
  verifyFullCompatibilityAssessment,
} from "./fullCompatibilityAssessmentVerification";

const result =
  verifyFullCompatibilityAssessment();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (
  !result.passed
) {
  throw new Error(
    "Full compatibility assessment verification failed.",
  );
}
