import { analyzeContextAlignment } from "./contextAlignment";
import { buildDecisionBrain } from "./decisionBrain";
import type {
  DecisionEngineInput,
  DecisionResult,
} from "./decisionTypes";
import { buildVerdict } from "./verdictBuilder";
import { buildCoreDecision } from "./coreDecisionBuilder";
import { buildDecisionResult } from "./decisionResultBuilder";
import {
  resolveConfidence,
  resolveActionReadiness,
} from "./decisionResolver";
import { buildVerdictContext } from "./verdictContextBuilder";
import { buildDirectionJudgement } from "./directionJudgementBuilder";
import { buildDecisionEvidence } from "./evidenceBuilder";
import {
  buildReaderAwareDecisionConditions,
} from "./conditionBuilder";
import {
  buildReaderAwareDecisionRisks,
} from "./riskBuilder";
import {
  assessDecisionReality,
} from "./decisionRealityAssessment";
import {
  assessCompatibility,
} from "./compatibilityAssessment";
import {
  applyCompatibilityVerdictEffect,
} from "./compatibilityVerdictBuilder";
import {
  assessTiming,
} from "./timingAssessment";
import {
  assessReaderDecision,
} from "./readerDecisionAssessment";
import {
  applyReaderDecisionVerdictEffect,
} from "./readerDecisionVerdictBuilder";
import {
  buildRoleRecommendationDecisionResult,
} from "./roleRecommendationDecisionBuilder";
import {
  buildLifeFlowInterpretationDecisionResult,
} from "./lifeFlowInterpretationDecisionBuilder";

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
  assessTiming(
    input.questionContext,
  );

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

    currentPhaseDescription:
      brain.snapshot.currentPhase,

    recommendedDirection:
      directionJudgement.recommendedDirection,
    prohibitedDirection:
      directionJudgement.prohibitedDirection,
  });
}
