import {
    verifyReaderDecisionAssessment,
  } from "./readerDecisionAssessmentVerification";
  
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