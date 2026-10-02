import {
  verifyUatPremiumGrantHandler,
} from "./uatPremiumGrantHandlerVerification.js";

const result =
  await verifyUatPremiumGrantHandler();

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
    "UAT premium grant handler verification failed.",
  );
}
