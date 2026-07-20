import {
    verifyReaderDecisionExplanationIntegration,
  } from "./readerDecisionExplanationIntegrationVerification";
  
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