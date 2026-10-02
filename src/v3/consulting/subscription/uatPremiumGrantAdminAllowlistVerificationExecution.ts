import {
  verifyUatPremiumGrantAdminAllowlist,
} from "./uatPremiumGrantAdminAllowlistVerification.js";

const result =
  verifyUatPremiumGrantAdminAllowlist();

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
    "UAT premium grant admin allowlist verification failed.",
  );
}
