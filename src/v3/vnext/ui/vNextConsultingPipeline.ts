/**
 * vNext UI Pipeline.
 *
 * 기존 v3 엔진을 수정하지 않고 read-only로 호출한 뒤
 * vNext Orchestrator → Response Action → NaturalConsultingResponse까지 연결한다.
 */

import {
  buildInitialConsultingExecution,
} from "../../consulting/initialConsultingExecutionBuilder.js";
import {
  buildTargetPeriodLuckFlowForQuestion,
} from "../../consulting/decision/targetPeriodLuckFlowBuilder.js";
import type {
  LifeFlowScope,
} from "../../consulting/question/lifeFlowTarget.js";
import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  generateNaturalConsultingResponse,
  generateNaturalConsultingResponseStreaming,
  type ResponseGateway,
} from "../gpt/responseGateway.js";
import {
  runVNextOrchestrator,
} from "../orchestration/vNextOrchestrator.js";
import {
  runResponsePipeline,
} from "../response/responseActionResolver.js";
import type {
  AnalysisRequest,
  AnalysisResult,
  AnswerMode,
  NaturalConsultingResponse,
  ResponsePrompt,
  TimeGranularity,
  TimePeriodRef,
} from "../types/index.js";
import type {
  ResponseStreamEvent,
} from "../gpt/responseStreamingTypes.js";
import type {
  ResponseAction,
} from "../response/responseContext.js";

export type VNextConsultingPipelineInput = {
  request: V3ConsultingRequest;
  answerMode?: AnswerMode;
  gateway: ResponseGateway;
  requestId?: string;
  onGenerating?: () => void;
  onAnalysisProgress?: VNextAnalysisProgressCallback;
  onStreamEvent?: (event: ResponseStreamEvent) => void;
  analysisStartedAt?: number;
};

export type VNextConsultingPipelineResult = {
  response: NaturalConsultingResponse;
  actionType: ResponseAction["type"];
  analysisResult: AnalysisResult;
};

export type VNextConsultingAnalysisResult = {
  analysisResult: AnalysisResult;
  action: ResponseAction;
  prompt: ResponsePrompt | null;
};

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

function buildTargetPeriodRef(
  target: {
    startDate: string;
    endDate: string;
    scope: LifeFlowScope;
    targetYear: number | null;
    targetMonth: number | null;
  },
): TimePeriodRef {
  const label = target.targetYear && target.targetMonth
    ? `${target.targetYear}-${String(target.targetMonth).padStart(2, "0")}`
    : target.targetYear
      ? String(target.targetYear)
      : undefined;

  return {
    start: target.startDate,
    end: target.endDate,
    granularity: mapLifeFlowScopeToGranularity(target.scope),
    label,
  };
}

export function buildAnalysisRequestFromV3Request(
  request: V3ConsultingRequest,
  answerMode: AnswerMode = "question",
  targetPeriod?: TimePeriodRef,
): AnalysisRequest {
  return {
    sources: ["saju"],
    humanInput: {
      birthDate: request.sajuInput.birthDate,
      birthTime: request.sajuInput.birthTime,
      gender: request.sajuInput.gender,
    },
    question: request.question.trim(),
    answerMode,
    targetPeriod: targetPeriod
      ? {
          start: targetPeriod.start,
          end: targetPeriod.end,
          granularity: targetPeriod.granularity,
          label: targetPeriod.label,
        }
      : undefined,
  };
}

/**
 * V3ConsultingRequest로 vNext 분석 단계까지 실행한다.
 */
export function analyzeVNextConsultingRequest(
  request: V3ConsultingRequest,
  answerMode: AnswerMode = "question",
): VNextConsultingAnalysisResult {
  const execution = buildInitialConsultingExecution(request);
  const { turnResult, humanDestinyPipeline } = execution;
  const questionContext = turnResult.questionContext;

  const targetPeriodBuildResult =
    humanDestinyPipeline.sajuFactsPipeline
    && (
      questionContext.requirements.lifeFlowInterpretationAnalysisRequired
      || questionContext.requirements.timingAnalysisRequired
    )
      ? buildTargetPeriodLuckFlowForQuestion({
          sajuFacts: humanDestinyPipeline.sajuFactsPipeline,
          normalizedQuestion: turnResult.questionReaderResult.normalizedQuestion,
          purpose: questionContext.requirements.lifeFlowInterpretationAnalysisRequired
            ? "lifeFlowInterpretation"
            : "decisionTiming",
          timingSearchRequired: questionContext.requirements.timingSearchRequired,
        })
      : null;

  if (targetPeriodBuildResult) {
    options.onProgress?.("targetPeriodResolved");
  }

  const targetPeriod = targetPeriodBuildResult?.target
    ? buildTargetPeriodRef(targetPeriodBuildResult.target)
    : undefined;

  const analysisRequest = buildAnalysisRequestFromV3Request(
    request,
    answerMode,
    targetPeriod,
  );

  const analysisResult = runVNextOrchestrator({
    analysisRequest,
    humanDestinyContext: humanDestinyPipeline.humanContext,
    targetPeriodLuckFlow: targetPeriodBuildResult?.fact ?? undefined,
    questionReaderResult: turnResult.questionReaderResult,
    decisionResult: turnResult.decisionResult,
    targetPeriod: targetPeriod ?? null,
  });
  options.onProgress?.("orchestrationComplete");

  const pipeline = runResponsePipeline({
    analysisResult,
    originalQuestion: request.question.trim(),
    answerMode,
  });

  const prompt = buildResponsePromptFromAction(pipeline.action);
  options.onProgress?.("responsePrepared");

  return {
    analysisResult,
    action: pipeline.action,
    prompt,
  };
}

/**
 * V3ConsultingRequest로 vNext 분석 파이프라인을 실행한다.
 */
export async function runVNextConsultingPipeline(
  input: VNextConsultingPipelineInput,
): Promise<VNextConsultingPipelineResult> {
  const analysisStartedAt = input.analysisStartedAt ?? Date.now();
  const analysis = analyzeVNextConsultingRequest(
    input.request,
    input.answerMode ?? "question",
    {
      onProgress: input.onAnalysisProgress,
    },
  );
  const analysisLatencyMs = Date.now() - analysisStartedAt;

  if (analysis.action.type === "consulting") {
    input.onGenerating?.();
  }

  const response = await generateNaturalConsultingResponseStreaming({
    action: analysis.action,
    prompt: analysis.prompt,
    gateway: input.gateway,
    options: {
      requestId: input.requestId,
    },
    analysisLatencyMs,
    onStreamEvent: input.onStreamEvent,
  });

  return {
    response,
    actionType: analysis.action.type,
    analysisResult: analysis.analysisResult,
  };
}

/**
 * non-streaming 경로 — STEP 4C verification 호환용.
 */
export async function runVNextConsultingPipelineNonStreaming(
  input: Omit<VNextConsultingPipelineInput, "onStreamEvent">,
): Promise<VNextConsultingPipelineResult> {
  const analysis = analyzeVNextConsultingRequest(
    input.request,
    input.answerMode ?? "question",
    {
      onProgress: input.onAnalysisProgress,
    },
  );

  if (analysis.action.type === "consulting") {
    input.onGenerating?.();
  }

  const response = await generateNaturalConsultingResponse({
    action: analysis.action,
    prompt: analysis.prompt,
    gateway: input.gateway,
    options: {
      requestId: input.requestId,
    },
  });

  return {
    response,
    actionType: analysis.action.type,
    analysisResult: analysis.analysisResult,
  };
}
