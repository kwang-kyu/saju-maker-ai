import {
    verifyRealEstateQuestionRegression,
  } from "./realEstateQuestionRegressionVerification";

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