import {
    verifyV3InitialConsultingSessionApi,
  } from "./v3InitialConsultingSessionApiVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyV3InitialConsultingSessionApi();

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
        "V3 initial consulting session API verification failed.",
      );
    }
  }

  void executeVerification();
