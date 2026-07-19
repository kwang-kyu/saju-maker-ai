import {
    verifyReaderDecisionEvidence,
  } from "./readerDecisionEvidenceVerification";
  
  const result =
    verifyReaderDecisionEvidence();
  
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