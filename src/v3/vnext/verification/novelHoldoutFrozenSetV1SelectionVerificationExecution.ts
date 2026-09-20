/**
 * Frozen Set v1 Selection verification execution.
 * Does not call QuestionReader / DecisionEngine / Freeze.
 */

import {
  serializeNovelHoldoutFrozenSetV1SelectionVerificationResult,
  verifyNovelHoldoutFrozenSetV1Selection,
} from "./novelHoldoutFrozenSetV1SelectionVerification.js";

process.stderr.write(
  "FSV1-SELECTION: starting verifyNovelHoldoutFrozenSetV1Selection...\n",
);

const result = verifyNovelHoldoutFrozenSetV1Selection();

process.stderr.write(
  [
    "FSV1-SELECTION: evaluation complete",
    `passed=${result.passed}`,
    `gateReady=${result.gateReady}`,
    `selectedCount=${result.selectedCount}`,
    `totalMinGap=${result.softGapReport.totalMinGap}`,
    `totalMaxHeadroom=${result.softGapReport.totalMaxHeadroom}`,
    `fingerprint=${result.selectionFingerprint}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeNovelHoldoutFrozenSetV1SelectionVerificationResult(result),
);

if (!result.passed) {
  throw new Error("FSV1-SELECTION Frozen Set v1 selection verification failed.");
}
