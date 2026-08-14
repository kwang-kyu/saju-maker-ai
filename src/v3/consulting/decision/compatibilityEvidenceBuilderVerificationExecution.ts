import {
  verifyCompatibilityEvidenceBuilder,
} from "./compatibilityEvidenceBuilderVerification";

const result =
  verifyCompatibilityEvidenceBuilder();

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
    "Compatibility evidence builder verification failed.",
  );
}
