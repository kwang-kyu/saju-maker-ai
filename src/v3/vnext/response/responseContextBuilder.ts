import type {
  AnalysisResult,
} from "../types/analysisResult.js";
import type {
  AnswerBlueprint,
} from "../types/answerBlueprint.js";
import type {
  AnswerMode,
} from "../types/answerBlueprint.js";
import type {
  Assessment,
} from "../types/assessment.js";
import type {
  ChangeSignal,
} from "../types/changeSignal.js";
import type {
  ConsultingScenario,
} from "../types/consultingScenario.js";
import type {
  HumanState,
} from "../types/humanState.js";
import type {
  MissingContextItem,
} from "../types/questionMeaning.js";
import type {
  TimeState,
} from "../types/timeState.js";
import type {
  ResponseContext,
  ResponseQuestionMeaningAxes,
} from "./responseContext.js";
import type {
  QuestionSpecificMaterialSelection,
} from "../adapters/questionSpecificMaterialAdapter.js";
import {
  resolveBlueprintBlockIds,
  selectResponseBlockContext,
  type ResponseSelectionContext,
} from "./responseEvidenceSelector.js";

export type ResponseContextBuilderInput = {
  analysisResult: AnalysisResult;
  originalQuestion: string;
  answerMode: AnswerMode;
  missingContext?: MissingContextItem[];
};

function readReadyValue<T>(
  stage: AnalysisResult[keyof AnalysisResult],
): T | undefined {
  if (!stage || stage.status !== "ready") {
    return undefined;
  }

  return stage.value as T;
}

function readBlueprintEmphasis(
  blueprint: AnswerBlueprint,
): string[] {
  return blueprint.emphasis ? [...blueprint.emphasis] : [];
}

function buildSelectionContext(
  input: ResponseContextBuilderInput,
  scenario: ConsultingScenario,
  blueprint: AnswerBlueprint,
): ResponseSelectionContext {
  return {
    scenario,
    questionMeaning: scenario.questionMeaning,
    blueprint,
    humanState: readReadyValue<HumanState>(input.analysisResult.humanState),
    timeState: readReadyValue<TimeState>(input.analysisResult.timeState),
    changeSignals:
      readReadyValue<ChangeSignal[]>(input.analysisResult.changeSignals) ?? [],
    assessment: readReadyValue<Assessment>(input.analysisResult.assessment),
    emphasis: readBlueprintEmphasis(blueprint),
    questionSpecificMaterials: readQuestionSpecificMaterials(
      input.analysisResult,
    ),
  };
}

function readQuestionSpecificMaterials(
  analysisResult: AnalysisResult,
): QuestionSpecificMaterialSelection | undefined {
  const stage = analysisResult.questionSpecificMaterials;

  if (!stage || stage.status !== "ready") {
    return undefined;
  }

  return stage.value;
}

/**
 * Assessment.evidence.summary(= DecisionResult.coreDecision) 원문을 그대로 읽는다.
 * 요약·재해석하지 않는다.
 */
function readLockedDecisionStatement(
  analysisResult: AnalysisResult,
): string | undefined {
  const assessment = readReadyValue<Assessment>(
    analysisResult.assessment,
  );
  const summary = assessment?.evidence.summary;

  if (typeof summary !== "string" || summary.length === 0) {
    return undefined;
  }

  return summary;
}

/**
 * Assessment.recommendedDirection(= DecisionResult.recommendedDirection) 원문을 그대로 읽는다.
 * 요약·재해석하지 않는다.
 */
function readRecommendedDirection(
  analysisResult: AnalysisResult,
): string | undefined {
  const assessment = readReadyValue<Assessment>(
    analysisResult.assessment,
  );
  const value = assessment?.recommendedDirection;

  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return value;
}

/**
 * Assessment.prohibitedDirection(= DecisionResult.prohibitedDirection) 원문을 그대로 읽는다.
 * 요약·재해석하지 않는다.
 */
function readProhibitedDirection(
  analysisResult: AnalysisResult,
): string | undefined {
  const assessment = readReadyValue<Assessment>(
    analysisResult.assessment,
  );
  const value = assessment?.prohibitedDirection;

  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return value;
}

/**
 * scenario.questionMeaning에서 Prompt용 의미축 6개만 그대로 읽는다.
 * 재분류·변환·전체 dump를 하지 않는다.
 */
function readQuestionMeaningAxes(
  scenario: ConsultingScenario,
): ResponseQuestionMeaningAxes {
  const meaning = scenario.questionMeaning;

  return {
    askedObject: meaning.askedObject,
    intent: meaning.intent,
    actionNature: meaning.actionNature,
    conclusionNature: meaning.conclusionNature,
    analysisMode: meaning.analysisMode,
    timingType: meaning.time.timingType,
    // P6-C: expression-only passthrough. Do not reinterpret.
    ...(meaning.prioritySurface === true
      ? { prioritySurface: true as const }
      : {}),
  };
}

function buildClarificationContext(
  input: ResponseContextBuilderInput,
  scenario: ConsultingScenario,
  blueprint: AnswerBlueprint,
  missingContext: MissingContextItem[],
): ResponseContext {
  return {
    originalQuestion: input.originalQuestion,
    answerMode: input.answerMode,
    scenario: scenario.type,
    blueprint,
    blocks: [{
      id: "followUpQuestion",
      relevantFacts: missingContext.map((item) => ({
        key: item.key,
        description: item.description,
        required: item.required,
      })),
      relevantSignals: [],
      relevantEvidence: [],
      emphasis: ["missingContext"],
    }],
    questionSpecificMaterials: readQuestionSpecificMaterials(
      input.analysisResult,
    ),
    missingContext,
  };
}

/**
 * AnalysisResult와 Blueprint를 바탕으로 GPT 직전 ResponseContext를 조립한다.
 * 사주 판단이나 새로운 결론을 생성하지 않는다.
 */
export function buildResponseContext(
  input: ResponseContextBuilderInput,
): ResponseContext | null {
  const scenario = readReadyValue<ConsultingScenario>(
    input.analysisResult.consultingScenario,
  );
  const blueprint = readReadyValue<AnswerBlueprint>(
    input.analysisResult.answerBlueprint,
  );

  if (!scenario || !blueprint) {
    return null;
  }

  const missingContext = input.missingContext
    ?? scenario.missingContext.filter((item) => item.required);

  if (missingContext.length > 0) {
    return buildClarificationContext(
      input,
      scenario,
      blueprint,
      missingContext,
    );
  }

  const selectionContext = buildSelectionContext(
    input,
    scenario,
    blueprint,
  );

  const blockIds = resolveBlueprintBlockIds(blueprint);
  const blocks = blockIds.map((blockId) =>
    selectResponseBlockContext(blockId, selectionContext),
  );

  const lockedDecisionStatement = readLockedDecisionStatement(
    input.analysisResult,
  );
  const recommendedDirection = readRecommendedDirection(
    input.analysisResult,
  );
  const prohibitedDirection = readProhibitedDirection(
    input.analysisResult,
  );

  return {
    originalQuestion: input.originalQuestion,
    answerMode: input.answerMode,
    scenario: scenario.type,
    blueprint,
    blocks,
    ...(lockedDecisionStatement !== undefined
      ? { lockedDecisionStatement, engineDecisionLocked: true }
      : {}),
    ...(recommendedDirection !== undefined
      ? { recommendedDirection }
      : {}),
    ...(prohibitedDirection !== undefined
      ? { prohibitedDirection }
      : {}),
    questionMeaningAxes: readQuestionMeaningAxes(scenario),
    questionSpecificMaterials: readQuestionSpecificMaterials(
      input.analysisResult,
    ),
  };
}

export function estimateResponseContextPayloadSize(
  context: ResponseContext,
): number {
  return JSON.stringify(context).length;
}

export function estimateResponseBlocksPayloadSize(
  context: ResponseContext,
): number {
  return JSON.stringify(context.blocks).length;
}

export function estimateSelectableAnalysisSize(
  analysisResult: AnalysisResult,
): number {
  const parts: Record<string, unknown> = {};

  if (analysisResult.humanState?.status === "ready") {
    parts.humanState = analysisResult.humanState.value;
  }

  if (analysisResult.timeState?.status === "ready") {
    parts.timeState = analysisResult.timeState.value;
  }

  if (analysisResult.changeSignals?.status === "ready") {
    parts.changeSignals = analysisResult.changeSignals.value;
  }

  if (analysisResult.assessment?.status === "ready") {
    parts.assessment = analysisResult.assessment.value;
  }

  return JSON.stringify(parts).length;
}
