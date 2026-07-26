import {
    verifyMasterReaderEvidenceDiversity,
  } from "./masterReaderEvidenceDiversityVerification";

  const verification =
    verifyMasterReaderEvidenceDiversity();

  console.log(
    JSON.stringify(
      verification,
      null,
      2,
    ),
  );

  if (!verification.passed) {
    throw new Error(
      "Master Reader evidence diversity verification failed.",
    );
  }