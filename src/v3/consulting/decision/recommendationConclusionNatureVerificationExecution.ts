import {
  verifyRecommendationConclusionNature,
} from "./recommendationConclusionNatureVerification.js";

const result =
  verifyRecommendationConclusionNature();

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
  process.exitCode = 1;
}
