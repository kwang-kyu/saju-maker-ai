/**
 * Q2 Explanation Packaging regression runner.
 *
 *   npx.cmd tsx src/v3/vnext/verification/q2ExplanationPackagingVerificationExecution.ts
 */

import {
  verifyQ2ExplanationPackaging,
} from "./q2ExplanationPackagingVerification.js";

const result = verifyQ2ExplanationPackaging();

console.log(
  JSON.stringify(
    {
      passed: result.passed,
      duplicateEvidenceTotal: result.duplicateEvidenceTotal,
      cases: result.cases.map((item) => ({
        id: item.id,
        passed: item.passed,
        questionText: item.questionText,
        decisionIntent: item.decisionIntent,
        meaningIntent: item.meaningIntent,
        scenarioType: item.scenarioType,
        matchedRuleId: item.matchedRuleId,
        requiredDomains: item.requiredDomains,
        blocks: item.blocks,
        duplicateEvidenceKeys: item.duplicateEvidenceKeys,
        engineDecisionLocked: item.engineDecisionLocked,
        promptHasEngineLock: item.promptHasEngineLock,
        promptHasRejudgeOpening: item.promptHasRejudgeOpening,
        details: item.details,
      })),
    },
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error("Q2 Explanation Packaging verification failed.");
}
