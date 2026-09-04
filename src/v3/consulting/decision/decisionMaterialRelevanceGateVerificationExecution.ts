import {
  verifyDecisionMaterialRelevanceGate,
} from "./decisionMaterialRelevanceGateVerification.js";

const result =
  verifyDecisionMaterialRelevanceGate();

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
