import {
    verifyV3ConsultingSessionApiClient,
  } from "./v3ConsultingSessionApiClientVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyV3ConsultingSessionApiClient();

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
        "V3 consulting session API client verification failed.",
      );
    }
  }

  void executeVerification();
