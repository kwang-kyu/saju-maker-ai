import {
    verifyCompatibilityAssessment,
  } from "./compatibilityAssessmentVerification.js";

  const result =
    verifyCompatibilityAssessment();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (
    !result.passed
  ) {
    throw new Error(
      "Compatibility assessment verification failed.",
    );
  }
