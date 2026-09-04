/**
 * vNext UI Pipeline.
 *
 * 기존 v3 엔진을 수정하지 않고 read-only로 호출한 뒤
 * vNext Orchestrator → Response Action → NaturalConsultingResponse까지 연결한다.
 */

import {
  buildHumanDestinyContextPipeline,
} from "../../builders/humanDestinyContextPipelineBuilder.js";
import {
  buildCounterpartSajuCalculation,
} from "../../consulting/decision/counterpartSajuCalculationBuilder.js";
import {
  runConsultingTurn,
} from "../../consulting/consultingRunner.js";
import {
  buildInitialConsultingExecution,
  type InitialConsultingExecutionResult,
} from "../../consulting/initialConsultingExecutionBuilder.js";
import type {
  QuestionReaderResult,
} from "../../consulting/question/questionReader.js";
import {
  readHumanLifeContext,
} from "../../readers/humanLifeContextReader.js";
import type {
  VNextAnalysisProgressCallback,
} from "./vNextAnalysisProgress.js";
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

function buildReferenceDate(
  referenceDateIso: string,
): Date {
  const [
    year,
    month,
    day,
  ] = referenceDateIso
    .split("-")
    .map(Number);

  const referenceDate = new Date(
    year,
    month - 1,
    day,
  );

  if (
    Number.isNaN(referenceDate.getTime())
    || referenceDate.getFullYear() !== year
    || referenceDate.getMonth() + 1 !== month
    || referenceDate.getDate() !== day
  ) {
    throw new Error(
      "referenceDate must use a valid YYYY-MM-DD format.",
    );
  }

  return referenceDate;
}

/**
 * buildInitialConsultingExecution과 동일한 호출 순서를 유지하면서
 * 실제 단계 완료 시점에 progress callback을 발생시킨다.
 *
 * callback이 없으면 공식 builder를 그대로 위임해
 * questionInterpretation / counterpartSaju 처리를 단일 경로로 보장한다.
 */
function buildInitialConsultingExecutionWithProgress(
  request: V3ConsultingRequest,
  onProgress?: VNextAnalysisProgressCallback,
  questionInterpretation?: QuestionReaderResult,
): InitialConsultingExecutionResult {
  if (!onProgress) {
    return buildInitialConsultingExecution(
      request,
      questionInterpretation,
    );
  }

  onProgress("birthInputValidated");

  const humanDestinyPipeline = buildHumanDestinyContextPipeline(
    request.sajuInput,
  );
  onProgress("sajuCalculated");

  const lifeContext = readHumanLifeContext({
    ...request.humanLifeContextInput,
    birthDate:
      humanDestinyPipeline.sajuFactsPipeline.calculatedSaju.solarDateIso,
    referenceDate: buildReferenceDate(
      request.sajuInput.referenceDate,
    ),
  });
  onProgress("humanContextReady");

  const counterpartFacts =
    questionInterpretation?.counterpartFacts;

  const counterpartSaju =
    counterpartFacts
    && counterpartFacts.birthDate
    && counterpartFacts.calendarType
    && counterpartFacts.gender
      ? buildCounterpartSajuCalculation({
          birthDate: counterpartFacts.birthDate,
          birthTime: counterpartFacts.birthTime,
          calendarType: counterpartFacts.calendarType,
          gender: counterpartFacts.gender,
        })
      : undefined;

  const turnResult = runConsultingTurn({
    sajuFacts: humanDestinyPipeline.sajuFactsPipeline,
    readerEvidence: humanDestinyPipeline.evidenceBundle,
    questionInterpretation,
    counterpartSaju,
    humanContext: humanDestinyPipeline.humanContext,
    lifeContext,
    question: request.question,
  });
  onProgress("consultingTurnComplete");

  return {
    humanDestinyPipeline,
    lifeContext,
    turnResult,
  };
}

export type AnalyzeVNextConsultingRequestOptions = {
  onProgress?: VNextAnalysisProgressCallback;
  questionInterpretation?: QuestionReaderResult;
};

/**
 * V3ConsultingRequest로 vNext 분석 단계까지 실행한다.
 */
export function analyzeVNextConsultingRequest(
  request: V3ConsultingRequest,
  answerMode: AnswerMode = "question",
  options: AnalyzeVNextConsultingRequestOptions = {},
): VNextConsultingAnalysisResult {
  const execution = buildInitialConsultingExecutionWithProgress(
    request,
    options.onProgress,
    options.questionInterpretation,
  );
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
    questionContext: turnResult.questionContext,
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
