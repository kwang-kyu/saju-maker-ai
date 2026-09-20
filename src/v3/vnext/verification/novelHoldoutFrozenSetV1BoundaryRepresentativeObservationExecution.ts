/**
 * FSV1 Boundary Representative — Boundary-only observation execution.
 *
 * Runs sealed BR-LJ-PERMHEAD-TERM-01 CONTRACT_CONFLICT observation.
 * Isolated from FSV1 160 / Freeze / Selection / official FailureLabel.
 */

import {
  serializeFsv1BoundaryRepresentativeObservationVerificationResult,
  verifyFsv1BoundaryRepresentativePermHeadContractConflictObservation,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeObservation.js";

process.stderr.write(
  "FSV1-BOUNDARY-REPRESENTATIVE-OBSERVATION: starting PERMHEAD CONTRACT_CONFLICT verify...\n",
);

const result =
  verifyFsv1BoundaryRepresentativePermHeadContractConflictObservation();

process.stderr.write(
  [
    "FSV1-BOUNDARY-REPRESENTATIVE-OBSERVATION: complete",
    `passed=${result.passed}`,
    `slotId=${result.row.slotId}`,
    `compare.match=${String(result.row.compare.match)}`,
    `observationalStatus=${result.row.observationalStatus}`,
    `permissionOrFeasibility=${String(result.row.evidence.permissionOrFeasibility)}`,
    `j431=${String(result.row.evidence.j431)}`,
    `j48=${String(result.row.evidence.j48)}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeFsv1BoundaryRepresentativeObservationVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    [
      "FSV1-BOUNDARY-REPRESENTATIVE-OBSERVATION failed",
      `violations=${result.violations.join(",")}`,
      `checks=${JSON.stringify(result.checks)}`,
    ].join(" | "),
  );
}
