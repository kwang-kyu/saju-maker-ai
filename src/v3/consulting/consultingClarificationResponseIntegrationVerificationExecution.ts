import {
    verifyConsultingClarificationResponseIntegration,
  } from "./consultingClarificationResponseIntegrationVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyConsultingClarificationResponseIntegration();

    console.log(
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    if (!result.passed) {
      throw new Error(
        "Consulting clarification response integration verification failed.",
      );
    }
  }

  void executeVerification();
