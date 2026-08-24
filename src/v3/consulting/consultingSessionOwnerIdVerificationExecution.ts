import {
    verifyConsultingSessionOwnerId,
  } from "./consultingSessionOwnerIdVerification.js";

  const result =
    verifyConsultingSessionOwnerId();

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
      "Consulting session owner id verification failed.",
    );
  }
