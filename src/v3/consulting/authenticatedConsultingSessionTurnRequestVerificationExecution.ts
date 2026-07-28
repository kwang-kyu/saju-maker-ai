import {
    verifyAuthenticatedConsultingSessionTurnRequest,
  } from "./authenticatedConsultingSessionTurnRequestVerification";

  function executeVerification():
    void {
    const result =
      verifyAuthenticatedConsultingSessionTurnRequest();

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
        "Authenticated consulting session turn request verification failed.",
      );
    }
  }

  executeVerification();
