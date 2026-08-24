import {
    verifyWealthConditionRegression,
  } from "./wealthConditionRegressionVerification.js";

  export const wealthConditionRegressionVerification =
    verifyWealthConditionRegression();

  console.log(
    JSON.stringify(
      wealthConditionRegressionVerification,
      null,
      2,
    ),
  );