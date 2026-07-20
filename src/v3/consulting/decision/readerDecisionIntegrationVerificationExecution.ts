import {
    verifyReaderDecisionIntegration,
  } from "./readerDecisionIntegrationVerification";
  
  const result =
    verifyReaderDecisionIntegration();
  
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