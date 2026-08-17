import {
  verifyLifeFlowInterpretationPath,
} from "./lifeFlowInterpretationVerification";

const result =
  verifyLifeFlowInterpretationPath();

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
    "Life flow interpretation verification failed.",
  );
}
