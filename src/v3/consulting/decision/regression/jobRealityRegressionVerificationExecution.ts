import {
    verifyJobRealityRegression,
  } from "./jobRealityRegressionVerification";

  export const jobRealityRegressionVerification =
    verifyJobRealityRegression();

  console.log(
    JSON.stringify(
      jobRealityRegressionVerification,
      null,
      2,
    ),
  );