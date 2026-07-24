import {
    verifyWealthConditionRegression,
  } from "./wealthConditionRegressionVerification";

  export const wealthConditionRegressionVerification =
    verifyWealthConditionRegression();

  console.log(
    JSON.stringify(
      wealthConditionRegressionVerification,
      null,
      2,
    ),
  );