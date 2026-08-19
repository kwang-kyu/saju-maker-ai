import {
    verifyTimingSearchPrompt,
  } from "./timingSearchPromptVerification";

  function executeVerification() {
    const result =
      verifyTimingSearchPrompt();

    console.log(
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    if (!result.passed) {
      throw new Error(
        "Timing search prompt verification failed.",
      );
    }
  }

  executeVerification();
