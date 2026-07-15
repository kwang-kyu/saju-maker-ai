import {
    BUSINESS_START_REGRESSION_CASE,
  } from "./businessStartRegressionCase";
  import {
    runDecisionEngineRegression,
  } from "./decisionEngineRegressionRunner";
  
  const result =
    runDecisionEngineRegression(
      BUSINESS_START_REGRESSION_CASE,
    );
  
  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );
  
  if (!result.passed) {
    process.exitCode = 1;
  }