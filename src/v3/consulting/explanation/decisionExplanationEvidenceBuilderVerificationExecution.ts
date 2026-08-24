import {
    verifyDecisionExplanationEvidenceBuilder,
  } from "./decisionExplanationEvidenceBuilderVerification.js";
  const result =
    verifyDecisionExplanationEvidenceBuilder();
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