import {
    verifyJobConditionRegression,
  } from "./jobConditionRegressionVerification";

  export const jobConditionRegressionVerification =
    verifyJobConditionRegression();

  console.log(
    JSON.stringify(
      jobConditionRegressionVerification,
      null,
      2,
    ),
  );