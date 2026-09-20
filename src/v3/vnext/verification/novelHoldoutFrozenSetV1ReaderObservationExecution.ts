/**
 * Frozen Set v1 READER OBSERVATION execution.
 *
 * Observation-only: records Production Reader actual vs Independent Gold
 * for Freeze-accepted FSV1 rows. Does not mutate Freeze / Question / Gold /
 * Production Reader.
 */

import {
  observeNovelHoldoutFrozenSetV1Reader,
  serializeNovelHoldoutFrozenSetV1ReaderObservationResult,
} from "./novelHoldoutFrozenSetV1ReaderObservation.js";

process.stderr.write(
  "FSV1-READER-OBSERVATION: starting observeNovelHoldoutFrozenSetV1Reader...\n",
);

const result = observeNovelHoldoutFrozenSetV1Reader();

process.stderr.write(
  [
    "FSV1-READER-OBSERVATION: evaluation complete",
    `passed=${result.passed}`,
    `reader=${result.reader}`,
    `readerExecuted=${result.readerExecuted}`,
    `acceptedCount=${result.acceptedCount}`,
    `observedCount=${result.observedCount}`,
    `missingCount=${result.missingCount}`,
    `duplicateCount=${result.duplicateCount}`,
    `freezeIntegrity=${result.freezeIntegrity}`,
    `goldSeparation=${result.goldSeparation}`,
    `exactMatch=${result.exactMatch}/${result.total}`,
    `match=${result.match}`,
    `mismatch=${result.mismatch}`,
    `freezeRevisionBefore=${result.freezeBefore?.freezeRevision ?? "n/a"}`,
    `freezeRevisionAfter=${result.freezeAfter?.freezeRevision ?? "n/a"}`,
    `contentHashBefore=${result.freezeBefore?.contentHash ?? "n/a"}`,
    `contentHashAfter=${result.freezeAfter?.contentHash ?? "n/a"}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeNovelHoldoutFrozenSetV1ReaderObservationResult(result),
);

if (result.freezeIntegrity !== "PASS") {
  throw new Error(
    [
      "FSV1-READER-OBSERVATION aborted / freeze integrity failed",
      `freezeIntegrity=${result.freezeIntegrity}`,
      `abortReason=${result.abortReason ?? "n/a"}`,
      `freezeRevisionBefore=${result.freezeBefore?.freezeRevision ?? "n/a"}`,
      `freezeRevisionAfter=${result.freezeAfter?.freezeRevision ?? "n/a"}`,
      `contentHashBefore=${result.freezeBefore?.contentHash ?? "n/a"}`,
      `contentHashAfter=${result.freezeAfter?.contentHash ?? "n/a"}`,
    ].join(" | "),
  );
}

if (!result.passed) {
  throw new Error(
    [
      "FSV1-READER-OBSERVATION harness failed",
      `reader=${result.reader}`,
      `acceptedCount=${result.acceptedCount}`,
      `observedCount=${result.observedCount}`,
      `missingCount=${result.missingCount}`,
      `duplicateCount=${result.duplicateCount}`,
      `goldSeparation=${result.goldSeparation}`,
      `checks=${JSON.stringify(result.checks)}`,
    ].join(" | "),
  );
}

// Accuracy mismatch is expected observation output — do not fail the harness.
console.error(
  [
    "FSV1-READER-OBSERVATION summary",
    `exactMatch=${result.exactMatch}/${result.total}`,
    `match=${result.match}`,
    `mismatch=${result.mismatch}`,
    `freezeIntegrity=${result.freezeIntegrity}`,
    `goldSeparation=${result.goldSeparation}`,
  ].join(" | "),
);
