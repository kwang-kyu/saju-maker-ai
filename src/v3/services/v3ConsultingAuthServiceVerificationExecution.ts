import {
    verifyV3ConsultingAuthService,
  } from "./v3ConsultingAuthServiceVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyV3ConsultingAuthService();

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
        "V3 consulting auth service verification failed.",
      );
    }
  }

  void executeVerification();
