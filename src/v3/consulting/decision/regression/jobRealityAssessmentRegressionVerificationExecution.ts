import {
    verifyJobRealityAssessmentRegression,
  } from "./jobRealityAssessmentRegressionVerification";

  export const jobRealityAssessmentRegressionVerification =
    verifyJobRealityAssessmentRegression();

  console.log(
    JSON.stringify(
      jobRealityAssessmentRegressionVerification,
      null,
      2,
    ),
  );