import {
    verifyMoneyQuestionRegression,
  } from "./moneyQuestionRegressionVerification";

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