import {
  verifyConsultingQuestionContextPromptPath,
} from "./consultingQuestionContextPromptPathVerification.js";

const result =
  verifyConsultingQuestionContextPromptPath();

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
    "consultingQuestionContextPromptPath verification failed.",
  );
}
