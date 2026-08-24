import {
    verifyConsultingSessionOwnerResolver,
  } from "./consultingSessionOwnerResolverVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyConsultingSessionOwnerResolver();

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
        "Consulting session owner resolver verification failed.",
      );
    }
  }

  void executeVerification();
