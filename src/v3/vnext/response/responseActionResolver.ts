import type {
  AnalysisResult,
} from "../types/analysisResult.js";
import type {
  Assessment,
} from "../types/assessment.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import type {
  ResponseAction,
  ResponsePipelineResult,
} from "./responseContext.js";
import {
  buildResponseContext,
  type ResponseContextBuilderInput,
} from "./responseContextBuilder.js";

export type ResponseActionResolverInput = {
  analysisResult: AnalysisResult;
  originalQuestion: string;
  answerMode: ResponseContextBuilderInput["answerMode"];
};

function readReadyValue<T>(
  stage: AnalysisResult[keyof AnalysisResult],
): T | undefined {
  if (!stage || stage.status !== "ready") {
    return undefined;
  }

  return stage.value as T;
}

function collectRequiredMissingContext(
  questionMeaning: QuestionMeaning | undefined,
  scenario: ConsultingScenario | undefined,
): Array<{
  key: string;
  description: string;
  required: boolean;
}> {
  const items = [
    ...(questionMeaning?.missingContext ?? []),
    ...(scenario?.missingContext ?? []),
  ];

  const deduped = new Map<string, typeof items[number]>();

  for (const item of items) {
    if (item.required) {
      deduped.set(item.key, item);
    }
  }

  return [...deduped.values()];
}

function isDirectOnlyCase(
  analysisResult: AnalysisResult,
): string | null {
  if (analysisResult.answerBlueprint?.status === "failed") {
    return "answer blueprint generation failed";
  }

  if (
    analysisResult.consultingScenario?.status === "failed"
    || analysisResult.questionMeaning?.status === "failed"
  ) {
    return "question understanding failed";
  }

  const assessment = readReadyValue<Assessment>(
    analysisResult.assessment,
  );

  if (
    assessment?.possibility === "insufficient"
    && assessment.direction === "unknown"
    && analysisResult.answerBlueprint?.status !== "ready"
  ) {
    return "assessment is insufficient and blueprint is unavailable";
  }

  return null;
}

/**
 * GPT 호출 여부를 결정한다. 새로운 판단을 만들지 않는다.
 */
export function resolveResponseAction(
  input: ResponseActionResolverInput,
): ResponseAction {
  const questionMeaning = readReadyValue<QuestionMeaning>(
    input.analysisResult.questionMeaning,
  );
  const scenario = readReadyValue<ConsultingScenario>(
    input.analysisResult.consultingScenario,
  );

  const requiredMissingContext = collectRequiredMissingContext(
    questionMeaning,
    scenario,
  );

  if (requiredMissingContext.length > 0) {
    const context = buildResponseContext({
      analysisResult: input.analysisResult,
      originalQuestion: input.originalQuestion,
      answerMode: input.answerMode,
      missingContext: requiredMissingContext,
    });

    return {
      type: "clarification",
      reason:
        "required missing context must be resolved before consulting response",
      context,
    };
  }

  const directReason = isDirectOnlyCase(input.analysisResult);

  if (directReason) {
    return {
      type: "direct",
      reason: directReason,
      context: null,
    };
  }

  const context = buildResponseContext({
    analysisResult: input.analysisResult,
    originalQuestion: input.originalQuestion,
    answerMode: input.answerMode,
  });

  if (!context) {
    return {
      type: "direct",
      reason: "response context could not be built from analysis result",
      context: null,
    };
  }

  return {
    type: "consulting",
    reason: "natural language consulting explanation is required",
    context,
  };
}

export function runResponsePipeline(
  input: ResponseActionResolverInput,
): ResponsePipelineResult {
  const action = resolveResponseAction(input);

  return {
    action,
    context: action.context,
  };
}
