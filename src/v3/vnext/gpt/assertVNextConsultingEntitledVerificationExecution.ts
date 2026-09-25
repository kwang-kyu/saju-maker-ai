import {
  verifyAssertVNextConsultingEntitled,
} from "./assertVNextConsultingEntitledVerification.js";

const result =
  await verifyAssertVNextConsultingEntitled();

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
    "assertVNextConsultingEntitled verification failed.",
  );
}
