import {
    verifyReaderDecisionExplanation,
  } from "./readerDecisionExplanationVerification.js";
  
  const result =
    verifyReaderDecisionExplanation();
  
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