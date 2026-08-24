import {
    verifyJobRealityAssessmentRegression,
  } from "./jobRealityAssessmentRegressionVerification.js";

  export const jobRealityAssessmentRegressionVerification =
    verifyJobRealityAssessmentRegression();

  console.log(
    JSON.stringify(
      jobRealityAssessmentRegressionVerification,
      null,
      2,
    ),
  );