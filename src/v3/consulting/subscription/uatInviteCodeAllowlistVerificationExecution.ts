import {
  verifyUatInviteCodeAllowlist,
} from "./uatInviteCodeAllowlistVerification.js";

const result =
  verifyUatInviteCodeAllowlist();

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
    "UAT invite code allowlist verification failed.",
  );
}
