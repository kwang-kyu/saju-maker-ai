import {
    verifyV3ConsultingSessionConversation,
  } from "./V3ConsultingSessionConversationVerification";

  function executeVerification():
    void {
    const result =
      verifyV3ConsultingSessionConversation();

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
        "V3 consulting session conversation verification failed.",
      );
    }
  }

  executeVerification();
