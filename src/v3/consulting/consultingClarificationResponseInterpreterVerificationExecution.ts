import {
    verifyConsultingClarificationResponseInterpreter,
  } from "./consultingClarificationResponseInterpreterVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyConsultingClarificationResponseInterpreter();

    console.log(
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    if (!result.passed) {
      throw new Error(
        "Consulting clarification response interpreter verification failed.",
      );
    }
  }

  void executeVerification();
