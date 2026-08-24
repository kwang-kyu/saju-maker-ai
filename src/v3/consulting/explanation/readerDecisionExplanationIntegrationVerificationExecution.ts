import {
    verifyReaderDecisionExplanationIntegration,
  } from "./readerDecisionExplanationIntegrationVerification.js";
  
  const result =
    verifyReaderDecisionExplanationIntegration();
  
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