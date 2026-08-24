import {
  verifyConsultingClarificationBuilderAdapter,
} from "./consultingClarificationBuilderAdapterVerification.js";

function executeVerification():
  void {
  const result =
    verifyConsultingClarificationBuilderAdapter();

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
      "Consulting clarification builder adapter verification failed.",
    );
  }
}

executeVerification();
