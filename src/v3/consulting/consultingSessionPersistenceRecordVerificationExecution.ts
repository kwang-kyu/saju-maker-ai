import {
    verifyConsultingSessionPersistenceRecord,
  } from "./consultingSessionPersistenceRecordVerification";

  const result =
    verifyConsultingSessionPersistenceRecord();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (
    !result.passed
  ) {
    throw new Error(
      "Consulting session persistence record verification failed.",
    );
  }
