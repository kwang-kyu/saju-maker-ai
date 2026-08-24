import {
    verifyConsultingSessionPromptBuilder,
  } from "./consultingSessionPromptBuilderVerification.js";

  const result =
    verifyConsultingSessionPromptBuilder();

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
      "Consulting session prompt builder verification failed.",
    );
  }
