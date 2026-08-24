import {
    verifyAuthenticatedInitialConsultingSessionService,
  } from "./authenticatedInitialConsultingSessionServiceVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedInitialConsultingSessionService();

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
        "Authenticated initial consulting session service verification failed.",
      );
    }
  }

  void executeVerification();
