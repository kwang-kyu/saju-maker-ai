import {
  verifyLifeFlowInterpretationAssessment,
} from "./lifeFlowInterpretationAssessmentVerification.js";

const result =
  verifyLifeFlowInterpretationAssessment();

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
    "Life flow interpretation assessment verification failed.",
  );
}
