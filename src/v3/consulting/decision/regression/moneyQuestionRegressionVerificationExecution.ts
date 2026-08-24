import {
    verifyMoneyQuestionRegression,
  } from "./moneyQuestionRegressionVerification.js";

  const result =
    verifyMoneyQuestionRegression();

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