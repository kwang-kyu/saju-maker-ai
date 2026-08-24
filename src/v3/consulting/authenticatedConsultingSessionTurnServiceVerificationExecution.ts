import {
    verifyAuthenticatedConsultingSessionTurnService,
  } from "./authenticatedConsultingSessionTurnServiceVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedConsultingSessionTurnService();

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
        "Authenticated consulting session turn service verification failed.",
      );
    }
  }

  void executeVerification();
