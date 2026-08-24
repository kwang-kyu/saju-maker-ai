import {
    verifyReaderDecisionVerdict,
  } from "./readerDecisionVerdictVerification.js";
  
  const result =
    verifyReaderDecisionVerdict();
  
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