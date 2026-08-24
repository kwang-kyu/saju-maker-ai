import {
    verifyJobRiskRegression,
  } from "./jobRiskRegressionVerification.js";

  export const jobRiskRegressionVerification =
    verifyJobRiskRegression();

  console.log(
    JSON.stringify(
      jobRiskRegressionVerification,
      null,
      2,
    ),
  );