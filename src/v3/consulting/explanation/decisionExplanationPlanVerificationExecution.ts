import {
  verifyDecisionExplanationPlan,
} from "./decisionExplanationPlanVerification.js";

const result =
  verifyDecisionExplanationPlan();

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
    "decisionExplanationPlan verification failed.",
  );
}
