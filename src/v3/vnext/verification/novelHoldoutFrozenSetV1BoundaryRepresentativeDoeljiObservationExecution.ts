/**
 * FSV1 Boundary Representative — D-only DOELJI observation execution.
 *
 * Runs sealed BR-SF-DOELJI-01 VOCABULARY_AUTHORING_GAP observation
 * plus BR-SF-DOELKKA-01 pair anchor confirmation.
 * Isolated from FSV1 160 / Freeze / Selection / FailureLabel / B observation.
 */

import {
  serializeFsv1BoundaryDoeljiObservationVerificationResult,
  verifyFsv1BoundaryDoeljiVocabularyAuthoringGapObservation,
} from "./novelHoldoutFrozenSetV1BoundaryRepresentativeDoeljiObservation.js";

process.stderr.write(
  "FSV1-BOUNDARY-REPRESENTATIVE-DOELJI-OBSERVATION: starting VOCABULARY_AUTHORING_GAP verify...\n",
);

const result = verifyFsv1BoundaryDoeljiVocabularyAuthoringGapObservation();

process.stderr.write(
  [
    "FSV1-BOUNDARY-REPRESENTATIVE-DOELJI-OBSERVATION: complete",
    `passed=${result.passed}`,
    `slotId=${result.row.slotId}`,
    `compare.match=${String(result.row.compare.match)}`,
    `observationalStatus=${result.row.observationalStatus}`,
    `surfaceDoelji=${String(result.row.evidence.surfaceDoelji)}`,
    `permissionKeywordMatched=${String(result.row.evidence.permissionKeywordMatched)}`,
    `usedFallbackIntent=${String(result.row.evidence.usedFallbackIntent)}`,
    `phase1Intent=${result.row.evidence.phase1Intent}`,
    `j431=${String(result.row.evidence.j431)}`,
    `j48=${String(result.row.evidence.j48)}`,
    `pairAnchor=${result.pairAnchor.slotId}`,
    `pairCompare.match=${String(result.pairAnchor.compare.match)}`,
    `pairModelB=${result.pairAnchor.modelBIntent}`,
  ].join(" | ") + "\n",
);

console.log(
  serializeFsv1BoundaryDoeljiObservationVerificationResult(result),
);

if (!result.passed) {
  throw new Error(
    [
      "FSV1-BOUNDARY-REPRESENTATIVE-DOELJI-OBSERVATION failed",
      `violations=${result.violations.join(",")}`,
      `checks=${JSON.stringify(result.checks)}`,
    ].join(" | "),
  );
}
