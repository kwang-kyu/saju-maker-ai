import {
    verifyWealthRealityRegression,
  } from "./wealthRealityRegressionVerification.js";

  export const wealthRealityRegressionVerification =
    verifyWealthRealityRegression();

  console.log(
    JSON.stringify(
      wealthRealityRegressionVerification,
      null,
      2,
    ),
  );