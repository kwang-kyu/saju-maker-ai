import {
    verifyConsultingClarificationProgressResolver,
  } from "./consultingClarificationProgressResolverVerification";

  function executeVerification(): void {
    const result =
      verifyConsultingClarificationProgressResolver();

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
        "Consulting clarification progress resolver verification failed.",
      );
    }
  }

  executeVerification();
