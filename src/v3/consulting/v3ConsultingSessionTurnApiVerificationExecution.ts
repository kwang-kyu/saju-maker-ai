import {
    verifyV3ConsultingSessionTurnApi,
  } from "./v3ConsultingSessionTurnApiVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyV3ConsultingSessionTurnApi();

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
        "V3 consulting session turn API verification failed.",
      );
    }
  }

  void executeVerification();
