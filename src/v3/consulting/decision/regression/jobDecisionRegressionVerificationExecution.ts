import {
    verifyJobDecisionRegression,
  } from "./jobDecisionRegressionVerification.js";

  export const jobDecisionRegressionVerification =
    verifyJobDecisionRegression();

  console.log(
    JSON.stringify(
      jobDecisionRegressionVerification,
      null,
      2,
    ),
  );