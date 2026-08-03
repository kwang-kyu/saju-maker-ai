import {
    verifyCompatibilityAssessment,
  } from "./compatibilityAssessmentVerification";

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
