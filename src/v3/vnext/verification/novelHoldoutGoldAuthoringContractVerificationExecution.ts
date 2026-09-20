/**
 * Novel Holdout Gold Authoring Contract verification execution.
 * Does not call QuestionReader / DecisionEngine / FSV1 Gold mutation.
 */

import {
  serializeNovelHoldoutGoldAuthoringContractVerificationResult,
  verifyNovelHoldoutGoldAuthoringContract,
} from "./novelHoldoutGoldAuthoringContractVerification.js";

const result = verifyNovelHoldoutGoldAuthoringContract();

console.log(
  serializeNovelHoldoutGoldAuthoringContractVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "Novel Holdout Gold Authoring Contract verification failed.",
  );
}
