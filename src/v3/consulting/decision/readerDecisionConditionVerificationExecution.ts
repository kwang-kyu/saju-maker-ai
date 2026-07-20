import {
    verifyReaderDecisionConditions,
  } from "./readerDecisionConditionVerification";
  
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