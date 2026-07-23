import {
    verifyJobDecisionRegression,
  } from "./jobDecisionRegressionVerification";

  export const jobDecisionRegressionVerification =
    verifyJobDecisionRegression();

  console.log(
    JSON.stringify(
      jobDecisionRegressionVerification,
      null,
      2,
    ),
  );