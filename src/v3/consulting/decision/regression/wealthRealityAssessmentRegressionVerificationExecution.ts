import {
    verifyWealthRealityAssessmentRegression,
  } from "./wealthRealityAssessmentRegressionVerification";

  export const wealthRealityAssessmentRegressionVerification =
    verifyWealthRealityAssessmentRegression();

  console.log(
    JSON.stringify(
      wealthRealityAssessmentRegressionVerification,
      null,
      2,
    ),
  );