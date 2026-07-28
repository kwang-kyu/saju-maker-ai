import {
    verifyAuthenticatedInitialConsultingSessionHttpHandler,
  } from "./authenticatedInitialConsultingSessionHttpHandlerVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedInitialConsultingSessionHttpHandler();

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
        "Authenticated initial consulting session HTTP handler verification failed.",
      );
    }
  }

  void executeVerification();
