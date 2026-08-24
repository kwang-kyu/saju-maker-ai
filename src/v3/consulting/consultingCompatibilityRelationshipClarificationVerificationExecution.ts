import {
    verifyConsultingCompatibilityRelationshipClarification,
  } from "./consultingCompatibilityRelationshipClarificationVerification.js";

  async function executeVerification():
    Promise<void> {
    const result =
      await verifyConsultingCompatibilityRelationshipClarification();

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
        "Consulting compatibility relationship clarification verification failed.",
      );
    }
  }

  void executeVerification();
