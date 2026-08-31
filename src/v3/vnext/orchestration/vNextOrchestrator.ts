import type {
  DecisionResult,
} from "../../consulting/decision/decisionTypes.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import type {
  SajuLuckFlowFact,
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact.js";
import type {
  QuestionReaderResult,
} from "../../consulting/question/questionReader.js";
import {
  adaptAssessment,
} from "../adapters/assessmentAdapter.js";
import {
  adaptHumanState,
} from "../adapters/humanStateAdapter.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";
import {
  adaptTimeState,
  hasTimeStateSource,
} from "../adapters/timeStateAdapter.js";
import {
  buildAnswerBlueprint,
} from "../blueprint/answerBlueprintBuilder.js";
import {
  routeScenario,
} from "../routing/scenarioRouter.js";
import {
  extractChangeSignals,
  shouldExtractChangeSignals,
} from "../signals/changeSignalExtractor.js";
import type {
  AnalysisRequest,
  AnalysisResult,
  Assessment,
  ChangeSignal,
  HumanState,
  PipelineStageResult,
  TimePeriodRef,
  TimeState,
} from "../types/index.js";

export type VNextOrchestratorInput = {
  analysisRequest: AnalysisRequest;
  humanDestinyContext?: HumanDestinyContext | null;
  targetPeriodLuckFlow?: SajuTargetPeriodLuckFlowFact | null;
  currentLuckFlow?: SajuLuckFlowFact | null;
  questionReaderResult?: QuestionReaderResult | null;
  decisionResult?: DecisionResult | null;
  targetPeriod?: TimePeriodRef | null;
};

function readyStage<T>(
  value: T,
): PipelineStageResult<T> {
  return {
    status: "ready",
    value,
  };
}

function skippedStage<T>(
  reason: string,
): PipelineStageResult<T> {
  return {
    status: "skipped",
    reason,
  };
}

function pendingStage<T>(): PipelineStageResult<T> {
  return {
    status: "pending",
  };
}

function scenarioRequiresHumanState(
  scenario: ReturnType<typeof routeScenario>,
): boolean {
  return scenario.requiredDomains.length > 0;
}

function scenarioRequiresTimeState(
  scenario: ReturnType<typeof routeScenario>,
): boolean {
  return scenario.requiredTimeGranularity.length > 0;
}

/**
 * Scenario에 따라 필요한 Adapter만 호출하여 AnalysisResult를 조립한다.
 * 기존 v3 엔진을 직접 실행하지 않는다.
 */
export function runVNextOrchestrator(
  input: VNextOrchestratorInput,
): AnalysisResult {
  const result: AnalysisResult = {};

  let questionMeaning = null;

  if (input.questionReaderResult) {
    questionMeaning = adaptQuestionMeaning(
      input.questionReaderResult,
    );
    result.questionMeaning = readyStage(questionMeaning);
  } else if (input.analysisRequest.question) {
    result.questionMeaning = pendingStage();
  } else {
    result.questionMeaning = skippedStage(
      "question reader result was not provided",
    );
  }

  if (!questionMeaning) {
    result.consultingScenario = skippedStage(
      "question meaning is required for scenario routing",
    );
    result.humanState = skippedStage(
      "scenario was not resolved",
    );
    result.timeState = skippedStage(
      "scenario was not resolved",
    );
    result.changeSignals = skippedStage(
      "scenario was not resolved",
    );
    result.answerBlueprint = skippedStage(
      "scenario was not resolved",
    );

    if (input.decisionResult) {
      result.assessment = readyStage(
        adaptAssessment(input.decisionResult),
      );
    } else {
      result.assessment = skippedStage(
        "decision result was not provided",
      );
    }

    return result;
  }

  const scenario = routeScenario(questionMeaning);
  result.consultingScenario = readyStage(scenario);

  if (
    scenarioRequiresHumanState(scenario)
    && input.humanDestinyContext
  ) {
    result.humanState = readyStage(
      adaptHumanState(
        {
          explanation:
            input.humanDestinyContext.identity.explanation,
          humanSummary:
            input.humanDestinyContext.identity.humanSummary,
          currentPhase:
            input.humanDestinyContext.currentPhase,
        },
        scenario.requiredDomains,
      ),
    );
  } else if (scenarioRequiresHumanState(scenario)) {
    result.humanState = pendingStage();
  } else {
    result.humanState = skippedStage(
      "scenario does not require human state",
    );
  }

  const timeInput = {
    targetPeriod: input.targetPeriod,
    targetPeriodLuckFlow: input.targetPeriodLuckFlow,
    currentLuckFlow: input.currentLuckFlow,
  };

  if (
    scenarioRequiresTimeState(scenario)
    && hasTimeStateSource(timeInput)
  ) {
    result.timeState = readyStage(
      adaptTimeState(timeInput),
    );
  } else if (scenarioRequiresTimeState(scenario)) {
    result.timeState = pendingStage();
  } else {
    result.timeState = skippedStage(
      "scenario does not require time state",
    );
  }

  let humanStateValue: HumanState | undefined;
  let timeStateValue: TimeState | undefined;
  let assessmentValue: Assessment | undefined;

  if (result.humanState?.status === "ready") {
    humanStateValue = result.humanState.value;
  }

  if (result.timeState?.status === "ready") {
    timeStateValue = result.timeState.value;
  }

  if (input.decisionResult) {
    assessmentValue = adaptAssessment(input.decisionResult);
    result.assessment = readyStage(assessmentValue);
  } else {
    result.assessment = skippedStage(
      "decision result was not provided",
    );
  }

  if (shouldExtractChangeSignals(scenario.requiredSignals)) {
    const signals = extractChangeSignals({
      humanState: humanStateValue,
      timeState: timeStateValue,
      assessment: assessmentValue,
      requiredSignals: scenario.requiredSignals,
    });

    result.changeSignals = readyStage(signals);
  } else {
    result.changeSignals = skippedStage(
      "scenario does not require change signals",
    );
  }

  if (questionMeaning) {
    const changeSignalValue: ChangeSignal[] =
      result.changeSignals?.status === "ready"
        ? result.changeSignals.value
        : [];

    result.answerBlueprint = readyStage(
      buildAnswerBlueprint({
        answerMode: input.analysisRequest.answerMode,
        scenario,
        questionMeaning,
        assessment: assessmentValue,
        changeSignals: changeSignalValue,
      }),
    );
  } else {
    result.answerBlueprint = skippedStage(
      "question meaning is required for answer blueprint",
    );
  }

  return result;
}
