import {
  verifyRoleRecommendationExplanation,
} from "./roleRecommendationExplanationVerification";

const result =
  verifyRoleRecommendationExplanation();

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
    "roleRecommendationExplanation verification failed.",
  );
}
