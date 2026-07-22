import {
    verifyJobQuestionRegression,
  } from "./jobQuestionRegressionVerification";

  export const jobQuestionRegressionVerification =
    verifyJobQuestionRegression();

  console.log(
    JSON.stringify(
      jobQuestionRegressionVerification,
      null,
      2,
    ),
  );