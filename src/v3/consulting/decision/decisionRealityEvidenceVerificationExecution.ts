import {
    verifyDecisionRealityEvidence,
  } from "./decisionRealityEvidenceVerification";

  const result =
    verifyDecisionRealityEvidence();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  export {
    result as decisionRealityEvidenceVerificationResult,
  };