import {
    verifyRealEstateQuestionRegression,
  } from "./realEstateQuestionRegressionVerification.js";

  const result =
    verifyRealEstateQuestionRegression();

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