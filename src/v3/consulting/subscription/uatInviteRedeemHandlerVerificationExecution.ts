import {
  verifyUatInviteRedeemHandler,
} from "./uatInviteRedeemHandlerVerification.js";

const result =
  await verifyUatInviteRedeemHandler();

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
    "UAT invite redeem handler verification failed.",
  );
}
