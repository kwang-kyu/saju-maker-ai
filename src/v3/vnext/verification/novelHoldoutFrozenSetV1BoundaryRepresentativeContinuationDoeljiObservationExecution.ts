/**
 * FSV1 Boundary Representative — CONTINUATION×DOELJI observation execution.
 *
 * Runs live fsv1-biz-buy-A-004 CONTINUATION_PRIORITY_DOELJI_GAP observation,
 * fsv1-biz-continue-A-001 anchor non-emission, plus B/D/E contrast separation.
 * Isolated from FSV1 160 / Freeze / Selection / FailureLabel / official pipeline.
 */

import {
  serializeFsv1BoundaryContinuationDoeljiObservationVerificationResult,
  verifyFsv1BoundaryContinuationDoeljiGapObservation,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeContinuationDoeljiObservation.js";

process.stderr.write(
  "FSV1-BOUNDARY-REPRESENTATIVE-CONTINUATION-DOELJI-OBSERVATION: starting CONTINUATION_PRIORITY_DOELJI_GAP verify...\n",
);

const result = verifyFsv1BoundaryContinuationDoeljiGapObservation();

process.stderr.write(
  [
    "FSV1-BOUNDARY-REPRESENTATIVE-CONTINUATION-DOELJI-OBSERVATION: complete",
    `passed=${result.passed}`,
    `slotId=${result.row.slotId}`,
    `compare.match=${String(result.row.compare.match)}`,
    `observationalStatus=${result.row.observationalStatus}`,
    `surfaceDoelji=${String(result.row.evidence.surfaceDoelji)}`,
    `continuationEvidence=${result.row.evidence.continuationEvidence.join(",")}`,
    `permissionKeywordMatched=${String(result.row.evidence.permissionKeywordMatched)}`,
    `usedFallbackIntent=${String(result.row.evidence.usedFallbackIntent)}`,
    `phase1Intent=${result.row.evidence.phase1Intent}`,
    `j431=${String(result.row.evidence.j431)}`,
    `j48=${String(result.row.evidence.j48)}`,
    `goldIntent=${result.row.evidence.goldIntent}`,
    `decisionTarget=${result.row.evidence.decisionTarget}`,
    `anchor=${result.anchor.slotId}:${result.anchor.observationalStatus}:rawEq=${String(result.anchor.rawGoldEqualsRawReader)}`,
    `bContrast=${result.bContrast.slotId}:${result.bContrast.observationalStatus}`,
    `dContrast=${result.dContrast.slotId}:${result.dContrast.observationalStatus}`,
    `eContrast=${result.eContrast.slotId}:${result.eContrast.observationalStatus}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeFsv1BoundaryContinuationDoeljiObservationVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    [
      "FSV1-BOUNDARY-REPRESENTATIVE-CONTINUATION-DOELJI-OBSERVATION failed",
      `violations=${result.violations.join(",")}`,
      `checks=${JSON.stringify(result.checks)}`,
    ].join(" | "),
  );
}
