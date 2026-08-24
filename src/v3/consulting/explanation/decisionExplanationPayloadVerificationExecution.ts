import {
  verifyDecisionExplanationPayload,
} from "./decisionExplanationPayloadVerification.js";

const result =
  verifyDecisionExplanationPayload();

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
    "decisionExplanationPayload verification failed.",
  );
}
