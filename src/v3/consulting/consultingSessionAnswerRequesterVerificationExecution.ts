import {
    verifyConsultingSessionAnswerRequester,
  } from "./consultingSessionAnswerRequesterVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyConsultingSessionAnswerRequester();

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
        "Consulting session answer requester verification failed.",
      );
    }
  }

  void executeVerification();
