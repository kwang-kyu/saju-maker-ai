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
): boolean {
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
  onAnalysisProgress?: VNextAnalysisProgressCallback,
): ResolvedConversationExecution {
  const cache = session.analysisCache;
  const reused = reusePlan
    ? resolveActualReuseFlags(reusePlan, cache)
    : {
        humanState: false,
        timeState: false,
        assessment: false,
        changeSignals: false,
        responseContext: false,
      };

  if (
    followUpType !== "initial"
    && reusePlan
    && canUseCacheOnlyPath(followUpType, reusePlan, cache, reused)
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
    },
  );

  if (followUpType === "initial" || !reusePlan) {
    return {
      analysis: freshAnalysis,
      effectiveQuestion,
      reused,
      executedStages: buildStageExecutionLabels(reused, "full"),
      pipelineMode: "full",
    };
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
    if (action?.type !== "clarification") {
      originalQuestion = turn.question;
    } else if (!originalQuestion) {
      originalQuestion = turn.question;
    }
  }

  return {
    lastCompletedTurnId: turn.turnId,
    awaitingClarification,
    pendingMissingContextKeys,
    originalQuestion,
    activeScenarioType: turn.scenario?.type ?? metadata.activeScenarioType,
    totalGptApiCallCount: metadata.totalGptApiCallCount + apiCallCount,
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

  const followUpResolution = previousTurn
    ? resolveFollowUpQuestionType({
        newQuestion: params.question,
        previousTurn,
        contextMetadata: session.contextMetadata,
        humanContext: resolveHumanContextForFollowUp(params.input.request),
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
    session,
    followUpType,
  );

  const effectiveQuestion = resolveEffectiveQuestionForResponse(
    params.question,
    session,
    followUpType,
    previousTurn,
  );

  const execution = executeConversationAnalysis(
    pipelineRequest,
    session,
    followUpType,
    reusePlan,
    answerMode,
    effectiveQuestion,
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
    session.analysisCache,
    turnId,
    execution.analysis.analysisResult,
    execution.analysis.action,
  );

  const contextMetadata = updateSessionContextMetadata(
    session.contextMetadata,
    turn,
    followUpType,
    response.apiCallCount,
  );

  const updatedSession: ConversationSession = {
    ...session,
    turns: [...session.turns, turn],
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
