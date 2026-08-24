import {
    verifyWealthRealityAssessmentRegression,
  } from "./wealthRealityAssessmentRegressionVerification.js";

  export const wealthRealityAssessmentRegressionVerification =
    verifyWealthRealityAssessmentRegression();

  console.log(
    JSON.stringify(
      wealthRealityAssessmentRegressionVerification,
      null,
      2,
    ),
  );