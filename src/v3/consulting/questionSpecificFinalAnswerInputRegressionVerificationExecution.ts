import {
  verifyQuestionSpecificFinalAnswerInputRegression,
} from "./questionSpecificFinalAnswerInputRegressionVerification.js";

const result =
  verifyQuestionSpecificFinalAnswerInputRegression();

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
