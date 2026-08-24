import {
  verifyConsultingClarificationItemState,
} from "./consultingClarificationItemStateVerification.js";

async function executeVerification():
  Promise<void> {
  const result =
    await verifyConsultingClarificationItemState();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Consulting clarification item state verification failed.",
    );
  }
}

void executeVerification();
