import {
  verifyConsultingClarificationAnswerBuilder,
} from "./consultingClarificationAnswerBuilderVerification.js";

function executeVerification():
  void {
  const result =
    verifyConsultingClarificationAnswerBuilder();

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
      "Consulting clarification answer builder verification failed.",
    );
  }
}

executeVerification();
