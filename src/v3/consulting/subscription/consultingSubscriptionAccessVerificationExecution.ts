import {
  verifyConsultingSubscriptionAccess,
} from "./consultingSubscriptionAccessVerification.js";

const result =
  verifyConsultingSubscriptionAccess();

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
    "Consulting subscription access verification failed.",
  );
}
