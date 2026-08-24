import {
  verifyConsultingPromptBuilder,
} from "./consultingPromptBuilderVerification.js";

const result =
  verifyConsultingPromptBuilder();

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
    "consultingPromptBuilder verification failed.",
  );
}
