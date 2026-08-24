import {
    verifyAuthenticatedConsultingSessionTurnCommandBuilder,
  } from "./authenticatedConsultingSessionTurnCommandBuilderVerification.js";

  function executeVerification():
    void {
    const result =
      verifyAuthenticatedConsultingSessionTurnCommandBuilder();

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
        "Authenticated consulting session turn command builder verification failed.",
      );
    }
  }

  executeVerification();
