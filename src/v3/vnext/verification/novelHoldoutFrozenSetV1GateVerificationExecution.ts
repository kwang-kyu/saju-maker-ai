/**
 * Frozen Set v1 Gate verification execution.
 * Does not call QuestionReader / DecisionEngine / Selection / Freeze.
 */

import {
  serializeNovelHoldoutFrozenSetV1GateVerificationResult,
  verifyNovelHoldoutFrozenSetV1Gates,
} from "./novelHoldoutFrozenSetV1GateVerification.js";

process.stderr.write("FSV1-GATE: starting verifyNovelHoldoutFrozenSetV1Gates...\n");

const result = verifyNovelHoldoutFrozenSetV1Gates();

process.stderr.write(
  [
    "FSV1-GATE: evaluation complete",
    `harnessPassed=${result.harnessPassed}`,
    `integrity=${result.integrity.status}`,
    `novelty=${JSON.stringify(result.novelty)}`,
    `leakage=${JSON.stringify(result.leakage)}`,
    `accepted=${result.acceptedCount}`,
    `review=${result.reviewCount}`,
    `rejected=${result.rejectedCount}`,
  ].join(" | ") + "\n",
);

console.log(serializeNovelHoldoutFrozenSetV1GateVerificationResult(result));

if (!result.harnessPassed) {
  throw new Error(
    "FSV1-GATE Frozen Set v1 gate harness failed (integrity/separation/pool).",
  );
}

if (!result.gateReady) {
  console.error(
    [
      "FSV1-GATE: harness OK but gateReady=false (REJECT present or incomplete)",
      `novelty=${JSON.stringify(result.novelty)}`,
      `leakage=${JSON.stringify(result.leakage)}`,
      `accepted=${result.acceptedCount}`,
      `review=${result.reviewCount}`,
      `rejected=${result.rejectedCount}`,
      `findings=${result.findings.length}`,
    ].join(" | "),
  );
  // Do not throw solely for REJECT/REVIEW — purpose is honest judgment.
  // Exit non-zero so the report is visible as incomplete readiness.
  process.exitCode = 2;
}
