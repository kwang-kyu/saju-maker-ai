import {
    verifyPersistedConsultingSessionTurnService,
  } from "./persistedConsultingSessionTurnServiceVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyPersistedConsultingSessionTurnService();

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
        "Persisted consulting session turn service verification failed.",
      );
    }
  }

  void executeVerification();
