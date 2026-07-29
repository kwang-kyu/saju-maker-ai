import {
    verifyUseV3ConsultingAuth,
  } from "./useV3ConsultingAuthVerification";

  function executeVerification():
    void {
    const result =
      verifyUseV3ConsultingAuth();

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
        "V3 consulting auth hook verification failed.",
      );
    }
  }

  executeVerification();
