import {
    verifyConsultingSessionTurnBuilder,
  } from "./consultingSessionTurnBuilderVerification.js";

  const result =
    verifyConsultingSessionTurnBuilder();

  console.log(
    JSON.stringify(
      {
        checks:
          result.checks,

        passed:
          result.passed,
      },
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Consulting session turn builder verification failed.",
    );
  }