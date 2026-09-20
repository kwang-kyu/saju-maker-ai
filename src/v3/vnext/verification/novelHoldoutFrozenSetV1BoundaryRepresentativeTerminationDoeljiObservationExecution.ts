/**
 * FSV1 Boundary Representative — E-only TERMINATION×DOELJI observation execution.
 *
 * Runs live fsv1-job-leaveJob-A-003 TERMINATION_PRIORITY_DOELJI_GAP observation
 * plus B/D contrast separation checks.
 * Isolated from FSV1 160 / Freeze / Selection / FailureLabel / official pipeline.
 */

import {
  serializeFsv1BoundaryTerminationDoeljiObservationVerificationResult,
  verifyFsv1BoundaryTerminationDoeljiGapObservation,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeTerminationDoeljiObservation.js";

process.stderr.write(
  "FSV1-BOUNDARY-REPRESENTATIVE-TERMINATION-DOELJI-OBSERVATION: starting TERMINATION_PRIORITY_DOELJI_GAP verify...\n",
);

const result = verifyFsv1BoundaryTerminationDoeljiGapObservation();

process.stderr.write(
  [
    "FSV1-BOUNDARY-REPRESENTATIVE-TERMINATION-DOELJI-OBSERVATION: complete",
    `passed=${result.passed}`,
    `slotId=${result.row.slotId}`,
    `compare.match=${String(result.row.compare.match)}`,
    `observationalStatus=${result.row.observationalStatus}`,
    `surfaceDoelji=${String(result.row.evidence.surfaceDoelji)}`,
    `terminationEvidence=${result.row.evidence.terminationEvidence.join(",")}`,
    `permissionKeywordMatched=${String(result.row.evidence.permissionKeywordMatched)}`,
    `usedFallbackIntent=${String(result.row.evidence.usedFallbackIntent)}`,
    `phase1Intent=${result.row.evidence.phase1Intent}`,
    `j431=${String(result.row.evidence.j431)}`,
    `j48=${String(result.row.evidence.j48)}`,
    `goldIntent=${result.row.evidence.goldIntent}`,
    `decisionTarget=${result.row.evidence.decisionTarget}`,
    `bContrast=${result.bContrast.slotId}:${result.bContrast.observationalStatus}`,
    `dContrast=${result.dContrast.slotId}:${result.dContrast.observationalStatus}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeFsv1BoundaryTerminationDoeljiObservationVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    [
      "FSV1-BOUNDARY-REPRESENTATIVE-TERMINATION-DOELJI-OBSERVATION failed",
      `violations=${result.violations.join(",")}`,
      `checks=${JSON.stringify(result.checks)}`,
    ].join(" | "),
  );
}
