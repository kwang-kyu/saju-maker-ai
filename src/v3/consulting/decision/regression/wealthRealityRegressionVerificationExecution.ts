import {
    verifyWealthRealityRegression,
  } from "./wealthRealityRegressionVerification";

  export const wealthRealityRegressionVerification =
    verifyWealthRealityRegression();

  console.log(
    JSON.stringify(
      wealthRealityRegressionVerification,
      null,
      2,
    ),
  );