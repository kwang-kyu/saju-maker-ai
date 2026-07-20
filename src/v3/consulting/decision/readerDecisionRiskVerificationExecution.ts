import {
    verifyReaderDecisionRisks,
  } from "./readerDecisionRiskVerification";
  
  const result =
    verifyReaderDecisionRisks();
  
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