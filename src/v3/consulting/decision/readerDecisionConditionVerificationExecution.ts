import {
    verifyReaderDecisionConditions,
  } from "./readerDecisionConditionVerification.js";
  
  const result =
    verifyReaderDecisionConditions();
  
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