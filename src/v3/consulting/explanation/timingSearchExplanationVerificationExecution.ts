import {
    verifyTimingSearchExplanation,
  } from "./timingSearchExplanationVerification";

  function executeVerification() {
    const result =
      verifyTimingSearchExplanation();

    console.log(
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    if (!result.passed) {
      throw new Error(
        "Timing search explanation verification failed.",
      );
    }
  }

  executeVerification();
