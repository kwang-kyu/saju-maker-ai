import {
    verifyConsultingSessionTurnExecutor,
  } from "./consultingSessionTurnExecutorVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyConsultingSessionTurnExecutor();

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
        "Consulting session turn executor verification failed.",
      );
    }
  }

  void executeVerification();
