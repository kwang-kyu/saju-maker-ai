import {
    verifyAuthenticatedInitialConsultingClarification,
  } from "./authenticatedInitialConsultingClarificationVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyAuthenticatedInitialConsultingClarification();

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
        "Authenticated initial consulting clarification verification failed.",
      );
    }
  }

  void executeVerification();
