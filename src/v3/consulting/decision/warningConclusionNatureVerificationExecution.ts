import {
  verifyWarningConclusionNature,
} from "./warningConclusionNatureVerification.js";

const result =
  verifyWarningConclusionNature();

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
