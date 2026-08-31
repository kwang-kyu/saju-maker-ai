import {
  verifyInterpretationConclusionNature,
} from "./interpretationConclusionNatureVerification.js";

const result =
  verifyInterpretationConclusionNature();

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
