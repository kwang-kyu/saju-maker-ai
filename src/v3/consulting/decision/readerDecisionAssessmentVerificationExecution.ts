import {
    verifyReaderDecisionAssessment,
  } from "./readerDecisionAssessmentVerification.js";
  
  const result =
    verifyReaderDecisionAssessment();
  
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