import {
  verifyConsultingGroundingContextBuilder,
} from "./consultingGroundingContextBuilderVerification";

const result =
  verifyConsultingGroundingContextBuilder();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (!result.passed) {
  process.exitCode = 1;
}
