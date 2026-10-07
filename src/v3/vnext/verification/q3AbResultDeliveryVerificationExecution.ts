/**
 * Q3 A/B Result Delivery regression runner.
 *
 *   npx.cmd tsx src/v3/vnext/verification/q3AbResultDeliveryVerificationExecution.ts
 */

import {
  verifyQ3AbResultDelivery,
} from "./q3AbResultDeliveryVerification.js";

const result = verifyQ3AbResultDelivery();

console.log(
  JSON.stringify(
    {
      passed: result.passed,
      duplicateEvidenceTotal: result.duplicateEvidenceTotal,
      cases: result.cases.map((item) => ({
        id: item.id,
        passed: item.passed,
        questionText: item.questionText,
        readerDecisionTarget: item.readerDecisionTarget,
        exclusiveAltParticipants: item.exclusiveAltParticipants,
        arms: item.arms,
        winner: item.winner,
        verdict: item.verdict,
        meaningActionNature: item.meaningActionNature,
        scenarioType: item.scenarioType,
        matchedRuleId: item.matchedRuleId,
        requiredDomains: item.requiredDomains,
        blocks: item.blocks,
        evidenceCount: item.evidenceCount,
        duplicateEvidenceKeys: item.duplicateEvidenceKeys,
        engineDecisionLocked: item.engineDecisionLocked,
        promptHasWinnerResult: item.promptHasWinnerResult,
        promptHasEngineLock: item.promptHasEngineLock,
        promptHasRejudgeOpening: item.promptHasRejudgeOpening,
        gptMayRejudgeAbsent: item.gptMayRejudgeAbsent,
        details: item.details,
      })),
    },
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error("Q3 A/B Result Delivery verification failed.");
}
