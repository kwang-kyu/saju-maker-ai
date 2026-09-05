/**
 * vNext Conversation Pipeline.
 *
 * multi-turn / cache / reuse 판단을 기존 runVNextConsultingPipeline 위에 얹는
 * 상위 orchestration layer.
 * 기존 v3 엔진 판단 로직을 수정하지 않는다.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  buildHumanDestinyContextPipeline,
} from "../../builders/humanDestinyContextPipelineBuilder.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import {
  readQuestion,
  type QuestionCounterpartFacts,
  type QuestionReaderResult,
} from "../../consulting/question/questionReader.js";
import type {
  LifeFlowScope,
  LifeFlowTarget,
} from "../../consulting/question/lifeFlowTarget.js";
import {
  resolveLifeFlowTarget,
} from "../../consulting/question/lifeFlowTargetResolver.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";
import {
  buildAnswerBlueprint,
} from "../blueprint/answerBlueprintBuilder.js";
import {
  generateNaturalConsultingResponse,
  generateNaturalConsultingResponseStreaming,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseStreamEvent,
} from "../gpt/responseStreamingTypes.js";
import {
  runResponsePipeline,
} from "../response/responseActionResolver.js";
import type {
  ResponseAction,
} from "../response/responseContext.js";
import type {
  AnalysisResult,
  AnswerMode,
  Assessment,
  ChangeSignal,
  HumanState,
  PipelineStageResult,
  QuestionMeaning,
  TimeGranularity,
  TimeState,
} from "../types/index.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  analyzeVNextConsultingRequest,
  type VNextConsultingAnalysisResult,
} from "../ui/vNextConsultingPipeline.js";
import type {
  VNextAnalysisProgressCallback,
} from "../ui/vNextAnalysisProgress.js";
import type {
  ConversationAnalysisCache,
} from "./conversationContextCache.js";
import {
  resolveConversationReusePlan,
  type ConversationReusePlan,
} from "./conversationReuseResolver.js";
import type {
  ConversationSession,
} from "./conversationSession.js";
import type {
  ConversationTurn,
} from "./conversationTurn.js";
import type {
  ConversationCacheEntry,
  ConversationCacheReuseMetadata,
  ConversationContextMetadata,
} from "./conversationTypes.js";
import {
  resolveFollowUpQuestionType,
  type FollowUpQuestionType,
} from "./followUpQuestionResolver.js";

export type VNextConversationPipelineOptions = {
  streaming?: boolean;
  answerMode?: AnswerMode;
  requestId?: string;
  onGenerating?: () => void;
  onAnalysisProgress?: VNextAnalysisProgressCallback;
  onStreamEvent?: (event: ResponseStreamEvent) => void;
  analysisStartedAt?: number;
};

export type VNextConversationPipelineInput = {
  session?: ConversationSession;
  question: string;
  input: {
    request: V3ConsultingRequest;
    gateway: ResponseGateway;
  };
  options?: VNextConversationPipelineOptions;
};

export type ConversationReusedFlags = {
  humanState: boolean;
  timeState: boolean;
  assessment: boolean;
  changeSignals: boolean;
  responseContext: boolean;
};

export type ConversationExecutionMetadata = {
  followUpType: FollowUpQuestionType | "initial";
  reusePlan: ConversationReusePlan | null;
  reused: ConversationReusedFlags;
  executedStages: string[];
  apiCallCount: number;
};

export type VNextConversationPipelineResult = {
  session: ConversationSession;
  turn: ConversationTurn;
  response: NaturalConsultingResponse;
  reusePlan: ConversationReusePlan | null;
  followUpType: FollowUpQuestionType | "initial";
  executionMetadata: ConversationExecutionMetadata;
};

type ResolvedConversationExecution = {
  analysis: VNextConsultingAnalysisResult;
  effectiveQuestion: string;
  reused: ConversationReusedFlags;
  executedStages: string[];
  pipelineMode: "cacheOnly" | "partial" | "full";
};

function generateConversationId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toReferenceDateIso(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : null;
}

function createInitialContextMetadata(): ConversationContextMetadata {
  const now = new Date().toISOString();

  return {
    lastCompletedTurnId: null,
    awaitingClarification: false,
    pendingMissingContextKeys: [],
    originalQuestion: null,
    activeScenarioType: null,
    totalGptApiCallCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function createConversationSession(): ConversationSession {
  return {
    sessionId: generateConversationId("session"),
    turns: [],
    analysisCache: {},
    contextMetadata: createInitialContextMetadata(),
  };
}

function hasReusableCacheEntry<T>(
  entry: ConversationCacheEntry<T> | undefined,
): entry is ConversationCacheEntry<T> {
  return entry?.reuseMetadata.reusable === true;
}

function readReadyValue<T>(
  stage: PipelineStageResult<T> | undefined,
): T | undefined {
  if (!stage || stage.status !== "ready") {
    return undefined;
  }

  return stage.value;
}

function toReadyStage<T>(value: T): PipelineStageResult<T> {
  return {
    status: "ready",
    value,
  };
}

function getPreviousTurn(
  session: ConversationSession,
): ConversationTurn | null {
  if (session.turns.length === 0) {
    return null;
  }

  return session.turns[session.turns.length - 1];
}

function resolveActualReuseFlags(
  reusePlan: ConversationReusePlan,
  cache: ConversationAnalysisCache,
): ConversationReusedFlags {
  return {
    humanState:
      reusePlan.reuseHumanState
      && hasReusableCacheEntry(cache.humanState),
    timeState:
      reusePlan.reuseTimeState
      && hasReusableCacheEntry(cache.timeState),
    assessment:
      reusePlan.reuseAssessment
      && hasReusableCacheEntry(cache.assessment),
    changeSignals:
      reusePlan.reuseChangeSignals
      && hasReusableCacheEntry(cache.changeSignals),
    responseContext:
      reusePlan.reusePreviousResponseContext
      && hasReusableCacheEntry(cache.responseContext),
  };
}

function normalizeIdentityAxis(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function identityAxesDiffer(
  current: string | null | undefined,
  cached: string | null | undefined,
): boolean {
  const left = normalizeIdentityAxis(current);
  const right = normalizeIdentityAxis(cached);

  return left !== null && right !== null && left !== right;
}

function mapLifeFlowScopeToGranularity(
  scope: LifeFlowScope,
): TimeGranularity {
  switch (scope) {
    case "day":
      return "day";
    case "month":
      return "month";
    case "year":
      return "year";
    case "halfYear":
      return "period";
    case "overall":
      return "life";
    default:
      return "period";
  }
}

function hasExplicitLifeFlowTime(target: LifeFlowTarget): boolean {
  return (
    target.scope === "year"
    || target.scope === "halfYear"
    || target.scope === "month"
    || target.scope === "day"
    || target.targetYear !== null
    || target.targetMonth !== null
    || target.targetDay !== null
    || target.half !== null
  );
}

function tryResolveLifeFlowTarget(
  question: string,
  referenceDateIso: string,
): LifeFlowTarget | null {
  try {
    return resolveLifeFlowTarget(question, referenceDateIso);
  } catch {
    return null;
  }
}

/**
 * 분석 전에도 비교 가능하도록 LifeFlowTarget → timePeriodKey 규칙을
 * buildTimeStateReuseMetadata / targetPeriod label 규칙과 맞춘다.
 */
function deriveTimeIdentityFromQuestion(
  question: string,
  referenceDateIso: string | null,
): {
  timeGranularity: TimeGranularity;
  timePeriodKey: string;
} | null {
  if (!referenceDateIso) {
    return null;
  }

  const target = tryResolveLifeFlowTarget(question, referenceDateIso);

  if (!target || !hasExplicitLifeFlowTime(target)) {
    return null;
  }

  const label = target.targetYear && target.targetMonth
    ? `${target.targetYear}-${String(target.targetMonth).padStart(2, "0")}`
    : target.targetYear
      ? String(target.targetYear)
      : undefined;

  return {
    timeGranularity: mapLifeFlowScopeToGranularity(target.scope),
    timePeriodKey: label ?? target.startDate,
  };
}

function readTimeIdentityFromTimeState(
  timeState: TimeState | undefined,
): {
  timeGranularity: TimeGranularity;
  timePeriodKey: string;
} | null {
  if (!timeState) {
    return null;
  }

  return {
    timeGranularity: timeState.targetPeriod.granularity,
    timePeriodKey:
      timeState.targetPeriod.label ?? timeState.targetPeriod.start,
  };
}

function hasTimeIdentityMismatch(
  current:
    | {
      timeGranularity: TimeGranularity;
      timePeriodKey: string;
    }
    | null,
  cache: ConversationAnalysisCache,
): boolean {
  if (!current || !cache.timeState) {
    return false;
  }

  const cachedGranularity = cache.timeState.reuseMetadata.timeGranularity;
  const cachedPeriodKey = cache.timeState.reuseMetadata.timePeriodKey;

  return identityAxesDiffer(current.timeGranularity, cachedGranularity)
    || identityAxesDiffer(current.timePeriodKey, cachedPeriodKey);
}

function hasNonTimeMeaningIdentityMismatch(
  current: {
    domain?: string | null;
    intent?: string | null;
    objectLabel?: string | null;
    scenarioType?: string | null;
  },
  cache: ConversationAnalysisCache,
): boolean {
  const cachedMeaning = cache.questionMeaning?.value;
  const cachedScenarioType = cache.scenario?.value.type;

  return identityAxesDiffer(current.domain, cachedMeaning?.domain)
    || identityAxesDiffer(current.intent, cachedMeaning?.intent)
    || identityAxesDiffer(current.objectLabel, cachedMeaning?.object?.label)
    || identityAxesDiffer(current.scenarioType, cachedScenarioType);
}

/**
 * FollowUp 분류만으로 cacheOnly/time/assessment 재사용을 허용하지 않는다.
 * 의미 identity가 다를 때만 차단하며, clarification·continuation 정상 경로는 유지한다.
 */
function hasMeaningIdentityMismatchForReuse(params: {
  followUpType: FollowUpQuestionType;
  currentQuestion: string;
  referenceDateIso: string | null;
  cache: ConversationAnalysisCache;
  meaningHint: QuestionMeaning | null;
  freshAnalysis: AnalysisResult | null;
}): boolean {
  const {
    followUpType,
    currentQuestion,
    referenceDateIso,
    cache,
    meaningHint,
    freshAnalysis,
  } = params;

  // clarification은 originalQuestion 기준 분석 — 현재 turn 문자열/힌트로 재사용을 막지 않는다.
  if (followUpType === "clarificationAnswer") {
    return false;
  }

  const questionTimeIdentity = deriveTimeIdentityFromQuestion(
    currentQuestion,
    referenceDateIso,
  );

  if (hasTimeIdentityMismatch(questionTimeIdentity, cache)) {
    return true;
  }

  const freshTimeState = freshAnalysis
    ? readReadyValue<TimeState>(freshAnalysis.timeState)
    : undefined;
  const freshTimeIdentity = questionTimeIdentity
    ? readTimeIdentityFromTimeState(freshTimeState)
    : null;

  if (hasTimeIdentityMismatch(freshTimeIdentity, cache)) {
    return true;
  }

  const freshMeaning = freshAnalysis
    ? readReadyValue<QuestionMeaning>(freshAnalysis.questionMeaning)
    : undefined;
  const freshScenario = freshAnalysis
    ? readReadyValue<ConsultingScenario>(freshAnalysis.consultingScenario)
    : undefined;

  // continuation 문구는 domain이 general로 떨어질 수 있어,
  // 시간 축 외에는 비-general hint가 있을 때만 비교한다.
  if (followUpType === "continuation") {
    if (!meaningHint || meaningHint.domain === "general") {
      return false;
    }

    return hasNonTimeMeaningIdentityMismatch(
      {
        domain: meaningHint.domain,
        intent: meaningHint.intent,
        objectLabel: meaningHint.object?.label,
        scenarioType: null,
      },
      cache,
    );
  }

  const meaningForCompare = freshMeaning ?? meaningHint;

  if (!meaningForCompare && !freshScenario) {
    return false;
  }

  return hasNonTimeMeaningIdentityMismatch(
    {
      domain: meaningForCompare?.domain,
      intent: meaningForCompare?.intent,
      objectLabel: meaningForCompare?.object?.label,
      scenarioType: freshScenario?.type,
    },
    cache,
  );
}

function applyMeaningIdentityReuseGate(
  reusePlan: ConversationReusePlan,
  reused: ConversationReusedFlags,
  identityMismatch: boolean,
): {
  reusePlan: ConversationReusePlan;
  reused: ConversationReusedFlags;
} {
  if (!identityMismatch) {
    return {
      reusePlan,
      reused,
    };
  }

  return {
    reusePlan: {
      ...reusePlan,
      reuseTimeState: false,
      reuseAssessment: false,
    },
    reused: {
      ...reused,
      timeState: false,
      assessment: false,
    },
  };
}

function buildHumanStateReuseMetadata(
  humanState: HumanState,
): ConversationCacheReuseMetadata {
  return {
    reusable: true,
    domains: humanState.domains.map((item) => item.domain),
  };
}

function buildTimeStateReuseMetadata(
  timeState: TimeState,
): ConversationCacheReuseMetadata {
  return {
    reusable: true,
    timeGranularity: timeState.targetPeriod.granularity,
    timePeriodKey: timeState.targetPeriod.label ?? timeState.targetPeriod.start,
  };
}

function buildCacheEntry<T>(
  value: T,
  turnId: string,
  reuseMetadata: ConversationCacheReuseMetadata,
): ConversationCacheEntry<T> {
  return {
    value,
    sourceTurnId: turnId,
    createdAt: new Date().toISOString(),
    reuseMetadata,
  };
}

function buildAnalysisResultFromCache(
  cache: ConversationAnalysisCache,
  reused: ConversationReusedFlags,
  answerMode: AnswerMode,
): AnalysisResult | null {
  const questionMeaning = cache.questionMeaning?.value;
  const scenario = cache.scenario?.value;

  if (!questionMeaning || !scenario) {
    return null;
  }

  const result: AnalysisResult = {
    questionMeaning: toReadyStage(questionMeaning),
    consultingScenario: toReadyStage(scenario),
  };

  if (reused.humanState && cache.humanState) {
    result.humanState = toReadyStage(cache.humanState.value);
  }

  if (reused.timeState && cache.timeState) {
    result.timeState = toReadyStage(cache.timeState.value);
  }

  if (reused.assessment && cache.assessment) {
    result.assessment = toReadyStage(cache.assessment.value);
  }

  if (reused.changeSignals && cache.changeSignals) {
    result.changeSignals = toReadyStage(cache.changeSignals.value);
  }

  const assessment = readReadyValue<Assessment>(result.assessment);
  const changeSignals =
    readReadyValue<ChangeSignal[]>(result.changeSignals) ?? [];

  result.answerBlueprint = toReadyStage(
    buildAnswerBlueprint({
      answerMode,
      scenario,
      questionMeaning,
      assessment,
      changeSignals,
    }),
  );

  return result;
}

function mergeAnalysisResultWithCache(
  fresh: AnalysisResult,
  cache: ConversationAnalysisCache,
  reused: ConversationReusedFlags,
): AnalysisResult {
  const merged: AnalysisResult = {
    ...fresh,
  };

  if (reused.humanState && cache.humanState) {
    merged.humanState = toReadyStage(cache.humanState.value);
  }

  if (reused.timeState && cache.timeState) {
    merged.timeState = toReadyStage(cache.timeState.value);
  }

  if (reused.assessment && cache.assessment) {
    merged.assessment = toReadyStage(cache.assessment.value);
  }

  if (reused.changeSignals && cache.changeSignals) {
    merged.changeSignals = toReadyStage(cache.changeSignals.value);
  }

  const questionMeaning = readReadyValue<QuestionMeaning>(
    merged.questionMeaning,
  );
  const scenario = readReadyValue<ConsultingScenario>(
    merged.consultingScenario,
  );
  const assessment = readReadyValue<Assessment>(merged.assessment);
  const changeSignals =
    readReadyValue<ChangeSignal[]>(merged.changeSignals) ?? [];

  if (questionMeaning && scenario) {
    merged.answerBlueprint = toReadyStage(
      buildAnswerBlueprint({
        answerMode: "question",
        scenario,
        questionMeaning,
        assessment,
        changeSignals,
      }),
    );
  }

  return merged;
}

function hasBlockedCacheEntry(
  cache: ConversationAnalysisCache,
): boolean {
  const entries = [
    cache.humanState,
    cache.timeState,
    cache.assessment,
    cache.changeSignals,
    cache.questionMeaning,
    cache.scenario,
    cache.responseContext,
  ];

  return entries.some(
    (entry) => entry !== undefined && entry.reuseMetadata.reusable === false,
  );
}

function canUseCacheOnlyPath(
  followUpType: FollowUpQuestionType,
  reusePlan: ConversationReusePlan,
  cache: ConversationAnalysisCache,
  reused: ConversationReusedFlags,
  meaningIdentityAligned: boolean,
): boolean {
  if (!meaningIdentityAligned) {
    return false;
  }

  if (followUpType !== "continuation" || reusePlan.requiresNewQuestionAnalysis) {
    return false;
  }

  if (hasBlockedCacheEntry(cache)) {
    return false;
  }

  if (
    !hasReusableCacheEntry(cache.questionMeaning)
    || !hasReusableCacheEntry(cache.scenario)
  ) {
    return false;
  }

  if (reusePlan.reuseHumanState && !reused.humanState) {
    return false;
  }

  if (reusePlan.reuseTimeState && !reused.timeState) {
    return false;
  }

  if (reusePlan.reuseAssessment && !reused.assessment) {
    return false;
  }

  if (reusePlan.reuseChangeSignals && !reused.changeSignals) {
    return false;
  }

  return true;
}

function mergeCounterpartFacts(
  existing: QuestionCounterpartFacts | undefined,
  incoming: QuestionCounterpartFacts,
): QuestionCounterpartFacts {
  return {
    birthDate: incoming.birthDate ?? existing?.birthDate ?? null,
    birthTime: incoming.birthTime ?? existing?.birthTime ?? null,
    calendarType: incoming.calendarType ?? existing?.calendarType ?? null,
    gender: incoming.gender ?? existing?.gender ?? null,
    zodiac: incoming.zodiac ?? existing?.zodiac ?? null,
    relationship: incoming.relationship ?? existing?.relationship ?? null,
    evidence: [
      ...(existing?.evidence ?? []),
      ...incoming.evidence,
    ],
  };
}

function readQuestionForSession(
  humanContext: HumanDestinyContext | null,
  question: string,
): QuestionReaderResult | null {
  if (!humanContext) {
    return null;
  }

  try {
    return readQuestion(humanContext, question.trim());
  } catch {
    return null;
  }
}

function hasStoredCounterpartFacts(
  facts: QuestionCounterpartFacts | undefined,
): facts is QuestionCounterpartFacts {
  if (!facts) {
    return false;
  }

  return Boolean(
    facts.birthDate
    || facts.birthTime
    || facts.calendarType
    || facts.gender
    || facts.zodiac
    || facts.relationship,
  );
}

function buildQuestionInterpretationForAnalysis(
  humanContext: HumanDestinyContext | null,
  question: string,
  sessionCounterpartFacts: QuestionCounterpartFacts | undefined,
): QuestionReaderResult | undefined {
  const readerResult = readQuestionForSession(humanContext, question);

  if (!readerResult) {
    return undefined;
  }

  if (!sessionCounterpartFacts) {
    return readerResult;
  }

  return {
    ...readerResult,
    counterpartFacts: mergeCounterpartFacts(
      sessionCounterpartFacts,
      readerResult.counterpartFacts,
    ),
  };
}

function resolveHumanContextForFollowUp(
  request: V3ConsultingRequest,
): HumanDestinyContext | null {
  try {
    return buildHumanDestinyContextPipeline(request.sajuInput).humanContext;
  } catch {
    return null;
  }
}

function buildStageExecutionLabels(
  reused: ConversationReusedFlags,
  pipelineMode: ResolvedConversationExecution["pipelineMode"],
): string[] {
  const stages = [`pipeline:${pipelineMode}`];

  const entries: Array<[keyof ConversationReusedFlags, string]> = [
    ["humanState", "humanState"],
    ["timeState", "timeState"],
    ["assessment", "assessment"],
    ["changeSignals", "changeSignals"],
    ["responseContext", "responseContext"],
  ];

  for (const [flag, label] of entries) {
    stages.push(`${label}:${reused[flag] ? "reused" : "executed"}`);
  }

  return stages;
}

function mergeClarificationIntoRequest(
  request: V3ConsultingRequest,
  originalQuestion: string,
  answer: string,
  pendingMissingContextKeys: string[],
): V3ConsultingRequest {
  const counterpartKeys = new Set([
    "counterpartBirthDate",
    "counterpartBirthTime",
    "counterpartGender",
    "counterpartZodiac",
  ]);

  const hasCounterpartKey = pendingMissingContextKeys.some((key) =>
    counterpartKeys.has(key),
  );

  const mergedQuestion = hasCounterpartKey
    ? `${originalQuestion} (상대방: ${answer.trim()})`
    : `${originalQuestion} (${answer.trim()})`;

  return {
    ...request,
    question: mergedQuestion,
  };
}

function resolvePipelineRequest(
  baseRequest: V3ConsultingRequest,
  question: string,
  session: ConversationSession,
  followUpType: FollowUpQuestionType | "initial",
): V3ConsultingRequest {
  if (followUpType !== "clarificationAnswer") {
    return {
      ...baseRequest,
      question: question.trim(),
    };
  }

  const originalQuestion =
    session.contextMetadata.originalQuestion
    ?? getPreviousTurn(session)?.question
    ?? question;

  return mergeClarificationIntoRequest(
    baseRequest,
    originalQuestion,
    question,
    session.contextMetadata.pendingMissingContextKeys,
  );
}

function resolveEffectiveQuestionForResponse(
  question: string,
  session: ConversationSession,
  followUpType: FollowUpQuestionType | "initial",
  previousTurn: ConversationTurn | null,
): string {
  if (followUpType === "clarificationAnswer") {
    return session.contextMetadata.originalQuestion
      ?? previousTurn?.question
      ?? question;
  }

  if (followUpType === "continuation" && previousTurn) {
    return previousTurn.question;
  }

  return question.trim();
}

function buildPromptForAction(
  action: ResponseAction,
): ReturnType<typeof buildResponsePromptFromAction> | null {
  if (action.type !== "consulting") {
    return null;
  }

  return buildResponsePromptFromAction(action);
}

function executeConversationAnalysis(
  request: V3ConsultingRequest,
  session: ConversationSession,
  followUpType: FollowUpQuestionType | "initial",
  reusePlan: ConversationReusePlan | null,
  answerMode: AnswerMode,
  effectiveQuestion: string,
  questionInterpretation: QuestionReaderResult | undefined,
  meaningHint: QuestionMeaning | null,
  referenceDateIso: string | null,
  onAnalysisProgress?: VNextAnalysisProgressCallback,
): ResolvedConversationExecution {
  const cache = session.analysisCache;
  let activeReusePlan = reusePlan;
  let reused = activeReusePlan
    ? resolveActualReuseFlags(activeReusePlan, cache)
    : {
        humanState: false,
        timeState: false,
        assessment: false,
        changeSignals: false,
        responseContext: false,
      };

  const preIdentityMismatch = followUpType !== "initial" && activeReusePlan
    ? hasMeaningIdentityMismatchForReuse({
        followUpType,
        currentQuestion: request.question,
        referenceDateIso,
        cache,
        meaningHint,
        freshAnalysis: null,
      })
    : false;

  if (activeReusePlan && preIdentityMismatch) {
    const gated = applyMeaningIdentityReuseGate(
      activeReusePlan,
      reused,
      true,
    );
    activeReusePlan = gated.reusePlan;
    reused = gated.reused;
  }

  if (
    followUpType !== "initial"
    && activeReusePlan
    && canUseCacheOnlyPath(
      followUpType,
      activeReusePlan,
      cache,
      reused,
      !preIdentityMismatch,
    )
  ) {
    const analysisResult = buildAnalysisResultFromCache(
      cache,
      reused,
      answerMode,
    );

    if (analysisResult) {
      const pipeline = runResponsePipeline({
        analysisResult,
        originalQuestion: effectiveQuestion,
        answerMode,
      });

      return {
        analysis: {
          analysisResult,
          action: pipeline.action,
          prompt: buildPromptForAction(pipeline.action),
        },
        effectiveQuestion,
        reused,
        executedStages: buildStageExecutionLabels(reused, "cacheOnly"),
        pipelineMode: "cacheOnly",
      };
    }
  }

  const freshAnalysis = analyzeVNextConsultingRequest(
    request,
    answerMode,
    {
      onProgress: onAnalysisProgress,
      questionInterpretation,
    },
  );

  if (followUpType === "initial" || !activeReusePlan) {
    return {
      analysis: freshAnalysis,
      effectiveQuestion,
      reused,
      executedStages: buildStageExecutionLabels(reused, "full"),
      pipelineMode: "full",
    };
  }

  const postIdentityMismatch = hasMeaningIdentityMismatchForReuse({
    followUpType,
    currentQuestion: request.question,
    referenceDateIso,
    cache,
    meaningHint,
    freshAnalysis: freshAnalysis.analysisResult,
  });

  if (postIdentityMismatch) {
    reused = applyMeaningIdentityReuseGate(
      activeReusePlan,
      reused,
      true,
    ).reused;
  }

  const mergedAnalysisResult = mergeAnalysisResultWithCache(
    freshAnalysis.analysisResult,
    cache,
    reused,
  );
  const pipeline = runResponsePipeline({
    analysisResult: mergedAnalysisResult,
    originalQuestion: effectiveQuestion,
    answerMode,
  });

  return {
    analysis: {
      analysisResult: mergedAnalysisResult,
      action: pipeline.action,
      prompt: buildPromptForAction(pipeline.action),
    },
    effectiveQuestion,
    reused,
    executedStages: buildStageExecutionLabels(reused, "partial"),
    pipelineMode: "partial",
  };
}

function updateAnalysisCacheFromResult(
  cache: ConversationAnalysisCache,
  turnId: string,
  analysisResult: AnalysisResult,
  action: ResponseAction,
): ConversationAnalysisCache {
  const next: ConversationAnalysisCache = {
    ...cache,
  };

  const humanState = readReadyValue<HumanState>(analysisResult.humanState);
  if (humanState) {
    next.humanState = buildCacheEntry(
      humanState,
      turnId,
      buildHumanStateReuseMetadata(humanState),
    );
  }

  const timeState = readReadyValue<TimeState>(analysisResult.timeState);
  if (timeState) {
    next.timeState = buildCacheEntry(
      timeState,
      turnId,
      buildTimeStateReuseMetadata(timeState),
    );
  }

  const assessment = readReadyValue<Assessment>(analysisResult.assessment);
  if (assessment) {
    next.assessment = buildCacheEntry(
      assessment,
      turnId,
      {
        reusable: true,
        scenarioType: readReadyValue<ConsultingScenario>(
          analysisResult.consultingScenario,
        )?.type,
      },
    );
  }

  const changeSignals = readReadyValue<ChangeSignal[]>(
    analysisResult.changeSignals,
  );
  if (changeSignals) {
    next.changeSignals = buildCacheEntry(
      changeSignals,
      turnId,
      {
        reusable: true,
      },
    );
  }

  const questionMeaning = readReadyValue<QuestionMeaning>(
    analysisResult.questionMeaning,
  );
  if (questionMeaning) {
    next.questionMeaning = buildCacheEntry(
      questionMeaning,
      turnId,
      {
        reusable: true,
        questionDomain: questionMeaning.domain,
      },
    );
  }

  const scenario = readReadyValue<ConsultingScenario>(
    analysisResult.consultingScenario,
  );
  if (scenario) {
    next.scenario = buildCacheEntry(
      scenario,
      turnId,
      {
        reusable: true,
        scenarioType: scenario.type,
        questionDomain: scenario.questionMeaning.domain,
      },
    );
  }

  if (action.type === "consulting" && action.context) {
    next.responseContext = buildCacheEntry(
      action.context,
      turnId,
      {
        reusable: true,
        scenarioType: action.context.scenario,
      },
    );
  }

  return next;
}

function buildConversationTurn(
  turnId: string,
  question: string,
  analysis: VNextConsultingAnalysisResult,
  response: NaturalConsultingResponse,
): ConversationTurn {
  return {
    turnId,
    question,
    questionMeaning: readReadyValue<QuestionMeaning>(
      analysis.analysisResult.questionMeaning,
    ) ?? null,
    scenario: readReadyValue<ConsultingScenario>(
      analysis.analysisResult.consultingScenario,
    ) ?? null,
    responseAction: analysis.action,
    response,
    createdAt: new Date().toISOString(),
  };
}

function collectPendingMissingContextKeys(
  action: ResponseAction,
): string[] {
  return action.context?.missingContext
    ?.filter((item) => item.required)
    .map((item) => item.key) ?? [];
}

function updateSessionContextMetadata(
  metadata: ConversationContextMetadata,
  turn: ConversationTurn,
  followUpType: FollowUpQuestionType | "initial",
  apiCallCount: number,
): ConversationContextMetadata {
  const now = new Date().toISOString();
  const action = turn.responseAction;

  let awaitingClarification = metadata.awaitingClarification;
  let pendingMissingContextKeys = [...metadata.pendingMissingContextKeys];
  let originalQuestion = metadata.originalQuestion;

  if (followUpType === "clarificationAnswer") {
    awaitingClarification = false;
    pendingMissingContextKeys = action?.type === "clarification"
      ? collectPendingMissingContextKeys(action)
      : [];
  } else if (action?.type === "clarification") {
    awaitingClarification = true;
    pendingMissingContextKeys = collectPendingMissingContextKeys(action);
    originalQuestion = originalQuestion ?? turn.question;
  } else {
    awaitingClarification = false;
    pendingMissingContextKeys = [];
  }

  if (followUpType === "initial" || followUpType === "newQuestion") {
    // newQuestion starts a new clarification chain even when the first
    // response of that chain is itself a clarification request.
    originalQuestion = turn.question;
  }

  return {
    lastCompletedTurnId: turn.turnId,
    awaitingClarification,
    pendingMissingContextKeys,
    originalQuestion,
    activeScenarioType: turn.scenario?.type ?? metadata.activeScenarioType,
    totalGptApiCallCount: metadata.totalGptApiCallCount + apiCallCount,
    counterpartFacts: metadata.counterpartFacts,
    createdAt: metadata.createdAt,
    updatedAt: now,
  };
}

async function generatePipelineResponse(
  analysis: VNextConsultingAnalysisResult,
  gateway: ResponseGateway,
  options: VNextConversationPipelineOptions | undefined,
  analysisLatencyMs: number,
): Promise<NaturalConsultingResponse> {
  if (analysis.action.type === "consulting") {
    options?.onGenerating?.();
  }

  const prompt = analysis.action.type === "consulting"
    ? analysis.prompt
    : null;

  if (options?.streaming) {
    return generateNaturalConsultingResponseStreaming({
      action: analysis.action,
      prompt,
      gateway,
      options: {
        requestId: options.requestId,
      },
      analysisLatencyMs,
      onStreamEvent: options.onStreamEvent,
    });
  }

  return generateNaturalConsultingResponse({
    action: analysis.action,
    prompt,
    gateway,
    options: {
      requestId: options?.requestId,
    },
  });
}

/**
 * multi-turn conversation pipeline entry point.
 */
export async function runVNextConversationPipeline(
  params: VNextConversationPipelineInput,
): Promise<VNextConversationPipelineResult> {
  const session = params.session ?? createConversationSession();
  const previousTurn = getPreviousTurn(session);
  const answerMode = params.options?.answerMode ?? "question";
  const analysisStartedAt = params.options?.analysisStartedAt ?? Date.now();
  const humanContext = resolveHumanContextForFollowUp(params.input.request);
  const currentReaderResult = readQuestionForSession(
    humanContext,
    params.question,
  );
  const mergedCounterpartFacts = currentReaderResult
    ? mergeCounterpartFacts(
        session.contextMetadata.counterpartFacts,
        currentReaderResult.counterpartFacts,
      )
    : session.contextMetadata.counterpartFacts;
  const sessionForPipeline: ConversationSession =
    mergedCounterpartFacts !== session.contextMetadata.counterpartFacts
      ? {
          ...session,
          contextMetadata: {
            ...session.contextMetadata,
            counterpartFacts: mergedCounterpartFacts,
          },
        }
      : session;

  const followUpResolution = previousTurn
    ? resolveFollowUpQuestionType({
        newQuestion: params.question,
        previousTurn,
        contextMetadata: sessionForPipeline.contextMetadata,
        humanContext,
      })
    : null;

  const followUpType: FollowUpQuestionType | "initial" =
    followUpResolution?.type ?? "initial";

  const reusePlan = followUpResolution
    ? resolveConversationReusePlan({
        followUpType: followUpResolution.type,
        cache: session.analysisCache,
      })
    : null;

  const pipelineRequest = resolvePipelineRequest(
    params.input.request,
    params.question,
    sessionForPipeline,
    followUpType,
  );

  const questionInterpretation = hasStoredCounterpartFacts(mergedCounterpartFacts)
    ? buildQuestionInterpretationForAnalysis(
        humanContext,
        pipelineRequest.question,
        mergedCounterpartFacts,
      )
    : undefined;

  const effectiveQuestion = resolveEffectiveQuestionForResponse(
    params.question,
    sessionForPipeline,
    followUpType,
    previousTurn,
  );

  const meaningHintSource = followUpResolution?.questionReaderResult
    ?? currentReaderResult;
  const meaningHint = meaningHintSource
    ? adaptQuestionMeaning(meaningHintSource)
    : null;

  const referenceDateIso = toReferenceDateIso(
    params.input.request.sajuInput.referenceDate,
  )
    ?? (
      previousTurn
        ? toReferenceDateIso(previousTurn.createdAt)
        : null
    )
    ?? toReferenceDateIso(sessionForPipeline.contextMetadata.updatedAt)
    ?? toReferenceDateIso(sessionForPipeline.contextMetadata.createdAt);

  const execution = executeConversationAnalysis(
    pipelineRequest,
    sessionForPipeline,
    followUpType,
    reusePlan,
    answerMode,
    effectiveQuestion,
    questionInterpretation,
    meaningHint,
    referenceDateIso,
    params.options?.onAnalysisProgress,
  );

  const analysisLatencyMs = Date.now() - analysisStartedAt;
  const response = await generatePipelineResponse(
    execution.analysis,
    params.input.gateway,
    params.options,
    analysisLatencyMs,
  );

  const turnId = generateConversationId("turn");
  const turn = buildConversationTurn(
    turnId,
    params.question.trim(),
    execution.analysis,
    response,
  );

  const updatedCache = updateAnalysisCacheFromResult(
    sessionForPipeline.analysisCache,
    turnId,
    execution.analysis.analysisResult,
    execution.analysis.action,
  );

  const contextMetadata = updateSessionContextMetadata(
    sessionForPipeline.contextMetadata,
    turn,
    followUpType,
    response.apiCallCount,
  );

  const updatedSession: ConversationSession = {
    ...sessionForPipeline,
    turns: [...sessionForPipeline.turns, turn],
    analysisCache: updatedCache,
    contextMetadata,
  };

  return {
    session: updatedSession,
    turn,
    response,
    reusePlan,
    followUpType,
    executionMetadata: {
      followUpType,
      reusePlan,
      reused: execution.reused,
      executedStages: execution.executedStages,
      apiCallCount: response.apiCallCount,
    },
  };
}
