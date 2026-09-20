/**
 * Novel Holdout Gold Authoring Contract × FSV1 verification execution.
 * READ-ONLY over FSV1 Gold 160. Does not call QuestionReader / mutate Gold.
 */

import {
  serializeNovelHoldoutGoldAuthoringContractFsv1VerificationResult,
  verifyNovelHoldoutGoldAuthoringContractFsv1,
} from "./novelHoldoutGoldAuthoringContractFsv1Verification.js";

const result = verifyNovelHoldoutGoldAuthoringContractFsv1();

process.stderr.write(
  [
    "GOLD-AUTHORING-CONTRACT-FSV1: complete",
    `passed=${result.passed}`,
    `verdict=${result.verdict}`,
    `goldCount=${result.goldCount}`,
    `selectionPrimaryCount=${result.selectionPrimaryCount}`,
    `reasonPrimaryCount=${result.reasonPrimaryCount}`,
    `decisionAxisHintMismatchCount=${result.decisionAxisHintMismatchCount}`,
    `secondarySpeechActFieldCount=${result.secondarySpeechActFieldCount}`,
    `readerExecuted=${result.readerExecuted}`,
    `sourceMutated=${result.sourceMutated}`,
    `violations=${result.violations.length}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeNovelHoldoutGoldAuthoringContractFsv1VerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    "Novel Holdout Gold Authoring Contract × FSV1 verification failed.",
  );
}
