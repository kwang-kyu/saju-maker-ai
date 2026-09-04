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
import {
  buildCareerRecommendationSource,
} from "./careerRecommendationSourceBuilder.js";
import {
  buildWarningConclusionSource,
} from "./warningConclusionSourceBuilder.js";
import {
  buildExistenceConclusionSource,
} from "./existenceConclusionSourceBuilder.js";
import {
  buildPredictionConclusionSource,
} from "./predictionConclusionSourceBuilder.js";
import {
  buildReaderDecisionEvidence,
} from "./readerDecisionEvidenceBuilder.js";
import {
  applyDecisionMaterialRelevanceGate,
} from "./decisionMaterialRelevanceGate.js";

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
      analysisMode:
        input.question.analysisMode,
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

  const {
    evidence:
      relevanceGatedEvidence,
    conditions:
      relevanceGatedConditions,
    risks:
      relevanceGatedRisks,
  } = applyDecisionMaterialRelevanceGate({
    evidence,
    conditions,
    risks,
    actionReadiness,
    decisionTarget:
      input.question.decisionTarget,
    intent:
      input.question.intent,
    topic:
      input.question.topic,
    originalQuestion:
      input.question.originalQuestion,
    questionContext:
      input.questionContext,
  });

  const careerRecommendation =
    input
      .question
      .conclusionNature
    === "recommendation"
      ? buildCareerRecommendationSource(
        input.humanContext,
      )
      : undefined;

  const warningConclusion =
    input
      .question
      .conclusionNature
    === "warning"
      ? buildWarningConclusionSource(
        relevanceGatedRisks,
        relevanceGatedConditions,
      )
      : undefined;

  const readerDecisionEvidence =
    buildReaderDecisionEvidence(
      input,
    );

  const existenceConclusion =
    input
      .question
      .conclusionNature
    === "existence"
    || input
      .question
      .intent
    === "existence"
      ? buildExistenceConclusionSource(
        input,
        readerDecisionAssessment,
        readerDecisionEvidence,
        relevanceGatedConditions,
      )
      : undefined;

  const predictionConclusion =
    input
      .question
      .conclusionNature
    === "prediction"
    || input
      .question
      .intent
    === "prediction"
      ? buildPredictionConclusionSource(
        input,
        readerDecisionAssessment,
        readerDecisionEvidence,
        relevanceGatedConditions,
      )
      : undefined;

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

      analysisMode:
        input.question.analysisMode,

      conclusionNature:
        input.question.conclusionNature,

      careerRecommendation,

      warningConclusion,

      existenceConclusion,

      predictionConclusion,
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

    evidence:
      relevanceGatedEvidence,
    conditions:
      relevanceGatedConditions,
    risks:
      relevanceGatedRisks,

    timingAssessment,

    currentPhaseDescription:
      brain.snapshot.currentPhase,

    recommendedDirection:
      directionJudgement.recommendedDirection,
    prohibitedDirection:
      directionJudgement.prohibitedDirection,
  });
}
