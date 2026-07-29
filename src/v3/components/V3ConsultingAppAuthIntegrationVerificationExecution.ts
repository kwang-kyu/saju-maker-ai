import {
    verifyV3ConsultingAppAuthIntegration,
  } from "./V3ConsultingAppAuthIntegrationVerification";

  function executeVerification():
    void {
    const result =
      verifyV3ConsultingAppAuthIntegration();

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
        "V3 consulting app authentication integration verification failed.",
      );
    }
  }

  executeVerification();
