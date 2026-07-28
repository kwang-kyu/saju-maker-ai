import {
    verifyInitialConsultingAnswerRequester,
  } from "./initialConsultingAnswerRequesterVerification";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyInitialConsultingAnswerRequester();

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
        "Initial consulting answer requester verification failed.",
      );
    }
  }

  void executeVerification();
