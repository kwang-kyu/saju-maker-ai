import {
    verifyConsultingSessionOpenAIRequestBuilder,
  } from "./consultingSessionOpenAIRequestBuilderVerification.js";

  const result =
    verifyConsultingSessionOpenAIRequestBuilder();

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
      "Consulting session OpenAI request builder verification failed.",
    );
  }
