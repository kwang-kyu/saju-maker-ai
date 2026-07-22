import {
    verifyJobRiskRegression,
  } from "./jobRiskRegressionVerification";

  export const jobRiskRegressionVerification =
    verifyJobRiskRegression();

  console.log(
    JSON.stringify(
      jobRiskRegressionVerification,
      null,
      2,
    ),
  );