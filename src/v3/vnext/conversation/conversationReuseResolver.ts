/**
 * vNext Conversation Reuse Resolver.
 *
 * follow-up 질문 유형에 따라 기존 분석 중 무엇을 재사용할지 결정한다.
 * 판단 결과를 새로 만들지 않으며, 캐시·reuse plan만 산출한다.
 */

import type {
  ConversationAnalysisCache,
} from "./conversationContextCache.js";
import type {
  FollowUpQuestionType,
} from "./followUpQuestionResolver.js";

export type ConversationReusePlan = {
  reuseHumanState: boolean;
  reuseTimeState: boolean;
  reuseAssessment: boolean;
  reuseChangeSignals: boolean;
  reusePreviousResponseContext: boolean;
  requiresNewQuestionAnalysis: boolean;
  requiresAssessmentRefresh: boolean;
  reason: string;
};

export type ConversationReuseResolverInput = {
  followUpType: FollowUpQuestionType;
  cache: ConversationAnalysisCache;
};

function hasReusableCacheEntry(
  entry: { reuseMetadata: { reusable: boolean } } | undefined,
): boolean {
  return entry?.reuseMetadata.reusable === true;
}

function buildPlan(
  partial: Omit<ConversationReusePlan, "reason"> & { reason: string },
): ConversationReusePlan {
  return partial;
}

/**
 * follow-up 유형과 현재 캐시 상태를 기준으로 재사용 계획을 만든다.
 */
export function resolveConversationReusePlan(
  input: ConversationReuseResolverInput,
): ConversationReusePlan {
  const {
    followUpType,
    cache,
  } = input;

  const canReuseHumanState = hasReusableCacheEntry(cache.humanState);
  const canReuseTimeState = hasReusableCacheEntry(cache.timeState);
  const canReuseAssessment = hasReusableCacheEntry(cache.assessment);
  const canReuseChangeSignals = hasReusableCacheEntry(cache.changeSignals);
  const canReuseResponseContext = hasReusableCacheEntry(cache.responseContext);

  switch (followUpType) {
    case "continuation":
      return buildPlan({
        reuseHumanState: canReuseHumanState,
        reuseTimeState: canReuseTimeState,
        reuseAssessment: canReuseAssessment,
        reuseChangeSignals: canReuseChangeSignals,
        reusePreviousResponseContext: canReuseResponseContext,
        requiresNewQuestionAnalysis: false,
        requiresAssessmentRefresh: false,
        reason: "continuation — maximize cache reuse, GPT context only change",
      });

    case "timeRefinement":
      return buildPlan({
        reuseHumanState: canReuseHumanState,
        reuseTimeState: canReuseTimeState,
        reuseAssessment: canReuseAssessment,
        reuseChangeSignals: canReuseChangeSignals,
        reusePreviousResponseContext: false,
        requiresNewQuestionAnalysis: true,
        requiresAssessmentRefresh: !canReuseTimeState,
        reason: "timeRefinement — reuse humanState, refresh time segment only",
      });

    case "scenarioRefinement":
      return buildPlan({
        reuseHumanState: canReuseHumanState,
        reuseTimeState: canReuseTimeState,
        reuseAssessment: false,
        reuseChangeSignals: canReuseChangeSignals,
        reusePreviousResponseContext: false,
        requiresNewQuestionAnalysis: true,
        requiresAssessmentRefresh: true,
        reason: "scenarioRefinement — reuse humanState, refresh assessment",
      });

    case "clarificationAnswer":
      return buildPlan({
        reuseHumanState: canReuseHumanState,
        reuseTimeState: false,
        reuseAssessment: false,
        reuseChangeSignals: false,
        reusePreviousResponseContext: false,
        requiresNewQuestionAnalysis: true,
        requiresAssessmentRefresh: true,
        reason: "clarificationAnswer — merge missing context, run required stages only",
      });

    case "newQuestion":
    default:
      return buildPlan({
        reuseHumanState: canReuseHumanState,
        reuseTimeState: false,
        reuseAssessment: false,
        reuseChangeSignals: false,
        reusePreviousResponseContext: false,
        requiresNewQuestionAnalysis: true,
        requiresAssessmentRefresh: true,
        reason: "newQuestion — new scenario, run required domains only",
      });
  }
}
