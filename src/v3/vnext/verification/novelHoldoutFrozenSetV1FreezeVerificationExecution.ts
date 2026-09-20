/**
 * Frozen Set v1 Sealed Freeze verification execution.
 * Does not call QuestionReader / DecisionEngine.
 */

import {
  serializeNovelHoldoutFrozenSetV1FreezeVerificationResult,
  verifyNovelHoldoutFrozenSetV1Freeze,
} from "./novelHoldoutFrozenSetV1FreezeVerification.js";

process.stderr.write(
  "FSV1-FREEZE: starting verifyNovelHoldoutFrozenSetV1Freeze...\n",
);

const result = verifyNovelHoldoutFrozenSetV1Freeze();

process.stderr.write(
  [
    "FSV1-FREEZE: evaluation complete",
    `passed=${result.passed}`,
    `sealed=${result.sealed}`,
    `selectedCount=${result.selectedCount}`,
    `acceptedCount=${result.acceptedCount}`,
    `rejectedCount=${result.rejectedCount}`,
    `draftExcludedCount=${result.draftExcludedCount}`,
    `rowCount=${result.rowCount}`,
    `contentHash=${result.contentHash}`,
    `readerExecuted=${result.readerExecuted}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeNovelHoldoutFrozenSetV1FreezeVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    [
      "FSV1-FREEZE Frozen Set v1 sealed freeze verification failed",
      `freezeRevision=${result.freezeRevision}`,
      `sealed=${result.sealed}`,
      `selectedCount=${result.selectedCount}`,
      `acceptedCount=${result.acceptedCount}`,
      `contentHash=${result.contentHash}`,
    ].join(" | "),
  );
}
