import {
  verifyRoleRecommendationAssessment,
} from "./roleRecommendationAssessmentVerification.js";

const result =
  verifyRoleRecommendationAssessment();

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
    "roleRecommendationAssessment verification failed.",
  );
}
