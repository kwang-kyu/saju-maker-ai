import { analyzeContextAlignment } from "./contextAlignment.js";
import { buildDecisionBrain } from "./decisionBrain.js";
import type {
  DecisionEngineInput,
  DecisionResult,
} from "./decisionTypes.js";
import { buildVerdict } from "./verdictBuilder.js";
import { buildCoreDecision } from "./coreDecisionBuilder.js";
import { buildDecisionResult } from "./decisionResultBuilder.js";
import {
  resolveConfidence,
  resolveActionReadiness,
} from "./decisionResolver.js";
import { buildVerdictContext } from "./verdictContextBuilder.js";
import { buildDirectionJudgement } from "./directionJudgementBuilder.js";
import { buildDecisionEvidence } from "./evidenceBuilder.js";
import {
  buildReaderAwareDecisionConditions,
} from "./conditionBuilder.js";
import {
  buildReaderAwareDecisionRisks,
} from "./riskBuilder.js";
import {
  assessDecisionReality,
} from "./decisionRealityAssessment.js";
import {
  assessCompatibility,
} from "./compatibilityAssessment.js";
import {
  applyCompatibilityVerdictEffect,
} from "./compatibilityVerdictBuilder.js";
import {
  assessTiming,
} from "./timingAssessment.js";
import {
  assessReaderDecision,
} from "./readerDecisionAssessment.js";
import {
  applyReaderDecisionVerdictEffect,
} from "./readerDecisionVerdictBuilder.js";
import {
  buildRoleRecommendationDecisionResult,
} from "./roleRecommendationDecisionBuilder.js";
import {
  buildLifeFlowInterpretationDecisionResult,
} from "./lifeFlowInterpretationDecisionBuilder.js";

/**
 * Decision Engine
 *
 * Human Destiny Context를 먼저 읽고,
 * Question Reader 결과를 마지막에 결합해
 * 엔진이 최종 DecisionResult를 생성한다.
 *
 * GPT는 이 결과를 변경하거나 새로 판단하지 않는다.
 */
export function runDecisionEngine(
  input: DecisionEngineInput,
): DecisionResult {
  if (
    input
      .questionContext
      .requirements
      .roleRecommendationAnalysisRequired
  ) {
    return buildRoleRecommendationDecisionResult(
      input,
    );
  }

  if (
    input
      .questionContext
      .requirements
      .lifeFlowInterpretationAnalysisRequired
  ) {
    return buildLifeFlowInterpretationDecisionResult(
      input,
    );
  }

  const brain = buildDecisionBrain(
    input.humanContext,
    input.question,
  );

  const alignmentResult = analyzeContextAlignment(
    input.humanContext,
    input.question,
  );

  const confidence = resolveConfidence(
    input.question.confidence,
    alignmentResult.alignment,
  );

  const lifeAssessment =
    assessDecisionReality(
      input.lifeContext,
      input.questionContext.reality,
    );

  const actionReadiness =
    resolveActionReadiness(
      alignmentResult.alignment,
      input.question.urgency,
      lifeAssessment,
    );

  const compatibilityAssessment =
    assessCompatibility(
    input.questionContext,
    input.selfYearGanZhi,
    input.counterpartSaju,
    input.selfSajuFacts,
  );

  const timingAssessment =
  assessTiming({
    questionContext:
      input.questionContext,

    humanContext:
      input.humanContext,

    selfSajuFacts:
      input.selfSajuFacts
      ?? null,

    lifeFlowTarget:
      input.lifeFlowTarget,

    targetPeriodLuckFlow:
      input.targetPeriodLuckFlow,
  });

  const readerDecisionAssessment =
  assessReaderDecision(
    input,
  );

  const verdictContext = buildVerdictContext({
    decisionInput: input,
    alignment: alignmentResult.alignment,
    readiness: actionReadiness,
    confidence,
    lifeAssessment,
    timingAssessment,
  });

  const baseVerdict =
  buildVerdict(
    verdictContext,
  );

  const readerAdjustedVerdict =
    applyReaderDecisionVerdictEffect({
      verdict:
        baseVerdict,

      assessment:
        readerDecisionAssessment,

      urgency:
        input.question.urgency,
    });

  const verdict =
    applyCompatibilityVerdictEffect({
      verdict:
        readerAdjustedVerdict,

      assessment:
        compatibilityAssessment,
        requestedAnalysisScope:
        input.question.analysisScope,
    });

    const directionJudgement = buildDirectionJudgement({
      verdict,

      context:
        verdictContext,

      intent:
        input.question.intent,

      decisionTarget:
        input.question.decisionTarget,
    });

  const evidence =
  buildDecisionEvidence(
    input,
    brain,
    lifeAssessment,
    compatibilityAssessment,
  );
  const conditions =
  buildReaderAwareDecisionConditions({
    decisionInput: input,

    readiness:
      actionReadiness,

    alignmentReason:
      alignmentResult.reason,

    lifeAssessment,

    compatibilityAssessment,

    timingAssessment,

    readerAssessment:
      readerDecisionAssessment,
  });

  const risks =
  buildReaderAwareDecisionRisks({
    decisionInput: input,

    alignment:
      alignmentResult.alignment,

    urgency:
      input.question.urgency,

    lifeAssessment,

    compatibilityAssessment,

    readerAssessment:
      readerDecisionAssessment,
  });
  const coreDecision = buildCoreDecision(
    verdict,
    input.question.decisionQuestion,
    {
      originalQuestion:
        input.question.originalQuestion,

      intent:
        input.question.intent,

      decisionTarget:
        input.question.decisionTarget,
    },
  );
  return buildDecisionResult({
    decisionInput: input,

    verdict,
    confidence,
    contextAlignment: alignmentResult.alignment,
    actionReadiness,

    coreDecision,
    decisionReason: alignmentResult.reason,

    evidence,
    conditions,
    risks,

    timingAssessment,

    currentPhaseDescription:
      brain.snapshot.currentPhase,

    recommendedDirection:
      directionJudgement.recommendedDirection,
    prohibitedDirection:
      directionJudgement.prohibitedDirection,
  });
}
