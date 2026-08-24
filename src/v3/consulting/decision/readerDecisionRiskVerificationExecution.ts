import {
    verifyReaderDecisionRisks,
  } from "./readerDecisionRiskVerification.js";
  
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