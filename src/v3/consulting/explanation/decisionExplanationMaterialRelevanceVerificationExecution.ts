import {
  verifyDecisionExplanationMaterialRelevance,
} from "./decisionExplanationMaterialRelevanceVerification.js";

const result =
  verifyDecisionExplanationMaterialRelevance();

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
