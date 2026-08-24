import {
    verifyAuthenticatedConsultingSessionTurnHttpHandler,
  } from "./authenticatedConsultingSessionTurnHttpHandlerVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedConsultingSessionTurnHttpHandler();

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
        "Authenticated consulting session turn HTTP handler verification failed.",
      );
    }
  }

  void executeVerification();
