import {
  verifySameClassificationQuestionMeaningRegression,
} from "./sameClassificationQuestionMeaningRegressionVerification.js";

const result =
  verifySameClassificationQuestionMeaningRegression();

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
