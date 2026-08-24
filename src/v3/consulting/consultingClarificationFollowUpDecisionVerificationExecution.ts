import {
  verifyConsultingClarificationFollowUpDecision,
} from "./consultingClarificationFollowUpDecisionVerification.js";

async function executeVerification():
  Promise<void> {
  const result =
    await verifyConsultingClarificationFollowUpDecision();

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
      "Consulting clarification follow-up decision verification failed.",
    );
  }
}

void executeVerification();
