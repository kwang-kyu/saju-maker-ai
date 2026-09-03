import {
  verifyQuestionMeaningRegression,
} from "./questionMeaningRegressionVerification.js";

const result =
  verifyQuestionMeaningRegression();

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
  process.exitCode =
    1;
}
