import {
    verifyMasterReaderEvidenceIntegration,
  } from "./masterReaderEvidenceIntegrationVerification";

  const verification =
    verifyMasterReaderEvidenceIntegration();

  console.log(
    JSON.stringify(
      verification,
      null,
      2,
    ),
  );

  if (!verification.passed) {
    throw new Error(
      "Master Reader evidence integration verification failed.",
    );
  }