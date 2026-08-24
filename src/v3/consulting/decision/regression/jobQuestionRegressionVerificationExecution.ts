import {
    verifyJobQuestionRegression,
  } from "./jobQuestionRegressionVerification.js";

  export const jobQuestionRegressionVerification =
    verifyJobQuestionRegression();

  console.log(
    JSON.stringify(
      jobQuestionRegressionVerification,
      null,
      2,
    ),
  );