import {
  verifyConsultingClarificationNeedAssessment,
} from "./consultingClarificationNeedAssessmentVerification.js";

function executeVerification():
  void {
  const result =
    verifyConsultingClarificationNeedAssessment();

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
      "Consulting clarification need assessment verification failed.",
    );
  }
}

executeVerification();
