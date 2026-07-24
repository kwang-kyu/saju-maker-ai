import {
    verifyWealthRiskRegression,
  } from "./wealthRiskRegressionVerification";
  const result =
    verifyWealthRiskRegression();
  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );
  if (!result.passed) {
    throw new Error(
      "Wealth Risk regression verification failed.",
    );
  }