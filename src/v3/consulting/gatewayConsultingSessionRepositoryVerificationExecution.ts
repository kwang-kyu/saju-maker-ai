import {
    verifyGatewayConsultingSessionRepository,
  } from "./gatewayConsultingSessionRepositoryVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyGatewayConsultingSessionRepository();

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
        "Gateway consulting session repository verification failed.",
      );
    }
  }

  void executeVerification();
