import {
    verifyJobConditionRegression,
  } from "./jobConditionRegressionVerification.js";

  export const jobConditionRegressionVerification =
    verifyJobConditionRegression();

  console.log(
    JSON.stringify(
      jobConditionRegressionVerification,
      null,
      2,
    ),
  );