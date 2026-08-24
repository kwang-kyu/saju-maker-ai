import {
    verifyJobRealityRegression,
  } from "./jobRealityRegressionVerification.js";

  export const jobRealityRegressionVerification =
    verifyJobRealityRegression();

  console.log(
    JSON.stringify(
      jobRealityRegressionVerification,
      null,
      2,
    ),
  );