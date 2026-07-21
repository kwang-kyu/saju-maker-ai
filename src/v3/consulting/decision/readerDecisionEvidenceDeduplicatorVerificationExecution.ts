import {
    verifyReaderDecisionEvidenceDeduplicator,
  } from "./readerDecisionEvidenceDeduplicatorVerification";
  const result =
    verifyReaderDecisionEvidenceDeduplicator();
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