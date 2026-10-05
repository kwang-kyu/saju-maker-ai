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
import {
  annotateDirectionWithWinnerArm,
  buildActionCandidateWinnerCoreDecision,
  buildWinnerAwareQuestion,
  resolveActionCandidateComparison,
} from "./actionCandidateComparison.js";

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

  // ACTION exclusive_alt 후보 비교 (있을 때만).
  // 없거나 비교 불가면 null → 아래 기존 single path 그대로.
  const actionCandidateComparison =
    resolveActionCandidateComparison({
      input,
      lifeAssessment,
      timingAssessment,
    });

  const effectiveAlignmentResult =
    actionCandidateComparison
      ? {
        alignment:
          actionCandidateComparison.winner.alignment,
        reason:
          actionCandidateComparison.winner.alignmentReason,
      }
      : alignmentResult;

  const effectiveConfidence =
    actionCandidateComparison
      ? actionCandidateComparison.winner.confidence
      : confidence;

  const effectiveActionReadiness =
    actionCandidateComparison
      ? actionCandidateComparison.winner.actionReadiness
      : actionReadiness;

  const effectiveQuestion =
    actionCandidateComparison
      ? buildWinnerAwareQuestion(
        input.question,
        actionCandidateComparison.winner,
      )
      : input.question;

  const effectiveInput: DecisionEngineInput =
    actionCandidateComparison
      ? {
        ...input,
        question: effectiveQuestion,
      }
      : input;

  const verdictContext = buildVerdictContext({
    decisionInput: effectiveInput,
    alignment: effectiveAlignmentResult.alignment,
    readiness: effectiveActionReadiness,
    confidence: effectiveConfidence,
    lifeAssessment,
    timingAssessment,
  });

  const baseVerdict =
    actionCandidateComparison
      ? actionCandidateComparison.winner.verdict
      : buildVerdict(
        verdictContext,
      );

  // 비교 승자 verdict는 arm별 buildVerdict를 유지한다.
  // choose 기반 reader/compatibility overlay가 우세 후보를 덮지 않는다.
  const readerAdjustedVerdict =
    actionCandidateComparison
      ? baseVerdict
      : applyReaderDecisionVerdictEffect({
        verdict:
          baseVerdict,

        assessment:
          readerDecisionAssessment,

        urgency:
          input.question.urgency,
      });

  const verdict =
    actionCandidateComparison
      ? baseVerdict
      : applyCompatibilityVerdictEffect({
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
        effectiveQuestion.intent,

      decisionTarget:
        effectiveQuestion.decisionTarget,
      analysisMode:
        effectiveQuestion.analysisMode,
    });

  const effectiveDirection =
    actionCandidateComparison
      ? annotateDirectionWithWinnerArm(
        actionCandidateComparison.winner,
        directionJudgement.recommendedDirection,
        directionJudgement.prohibitedDirection,
      )
      : directionJudgement;

  const evidence =
  buildDecisionEvidence(
    effectiveInput,
    brain,
    lifeAssessment,
    compatibilityAssessment,
  );
  const conditions =
  buildReaderAwareDecisionConditions({
    decisionInput: effectiveInput,

    readiness:
      effectiveActionReadiness,

    alignmentReason:
      effectiveAlignmentResult.reason,

    lifeAssessment,

    compatibilityAssessment,

    timingAssessment,

    readerAssessment:
      readerDecisionAssessment,
  });

  const risks =
  buildReaderAwareDecisionRisks({
    decisionInput: effectiveInput,

    alignment:
      effectiveAlignmentResult.alignment,

    urgency:
      effectiveQuestion.urgency,

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
    actionReadiness: effectiveActionReadiness,
    decisionTarget:
      effectiveQuestion.decisionTarget,
    intent:
      effectiveQuestion.intent,
    topic:
      effectiveQuestion.topic,
    originalQuestion:
      effectiveQuestion.originalQuestion,
    questionContext:
      input.questionContext,
  });

  const careerRecommendation =
    effectiveQuestion
      .conclusionNature
    === "recommendation"
      ? buildCareerRecommendationSource(
        input.humanContext,
      )
      : undefined;

  const warningConclusion =
    effectiveQuestion
      .conclusionNature
    === "warning"
      ? buildWarningConclusionSource(
        relevanceGatedRisks,
        relevanceGatedConditions,
      )
      : undefined;

  const readerDecisionEvidence =
    buildReaderDecisionEvidence(
      effectiveInput,
    );

  const existenceConclusion =
    effectiveQuestion
      .conclusionNature
    === "existence"
    || effectiveQuestion
      .intent
    === "existence"
      ? buildExistenceConclusionSource(
        effectiveInput,
        readerDecisionAssessment,
        readerDecisionEvidence,
        relevanceGatedConditions,
      )
      : undefined;

  // analysisScope === "zodiac"이면 relationship-summary 기반
  // prediction 조립이 zodiac verdict를 덮지 않도록 한다.
  // applyCompatibilityVerdictEffect는 유지하고, GPT 재판단 계약도 변경하지 않는다.
  const predictionConclusion =
    effectiveQuestion
      .analysisScope
    !== "zodiac"
    && (
      effectiveQuestion
        .conclusionNature
      === "prediction"
      || effectiveQuestion
        .intent
      === "prediction"
    )
      ? buildPredictionConclusionSource(
        effectiveInput,
        readerDecisionAssessment,
        readerDecisionEvidence,
        relevanceGatedConditions,
      )
      : undefined;

  const coreDecision = actionCandidateComparison
    ? buildActionCandidateWinnerCoreDecision(
      actionCandidateComparison.winner,
    )
    : buildCoreDecision(
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
    decisionInput: effectiveInput,

    verdict,
    confidence: effectiveConfidence,
    contextAlignment: effectiveAlignmentResult.alignment,
    actionReadiness: effectiveActionReadiness,

    coreDecision,
    decisionReason: effectiveAlignmentResult.reason,

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
      effectiveDirection.recommendedDirection,
    prohibitedDirection:
      effectiveDirection.prohibitedDirection,
  });
}
