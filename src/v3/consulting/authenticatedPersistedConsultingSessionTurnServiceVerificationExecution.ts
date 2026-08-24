import {
    verifyAuthenticatedPersistedConsultingSessionTurnService,
  } from "./authenticatedPersistedConsultingSessionTurnServiceVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedPersistedConsultingSessionTurnService();

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
        "Authenticated persisted consulting session turn service verification failed.",
      );
    }
  }

  void executeVerification();
