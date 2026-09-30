import type {
  AnswerBlueprint,
  AnswerMode,
  GeneralFlowTimeStructure,
  ScenarioAnswerBlock,
} from "../types/answerBlueprint.js";
import type {
  Assessment,
} from "../types/assessment.js";
import type {
  ChangeSignal,
  ChangeSignalType,
} from "../types/changeSignal.js";
import type {
  ConsultingScenario,
  ConsultingScenarioType,
} from "../types/consultingScenario.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import {
  resolveGeneralFlowBlocks,
  resolveGeneralFlowTimeStructure,
} from "./generalFlowTimeStructure.js";

export type AnswerBlueprintBuilderInput = {
  answerMode: AnswerMode;
  scenario: ConsultingScenario;
  questionMeaning: QuestionMeaning;
  assessment?: Assessment;
  changeSignals?: readonly ChangeSignal[];
};

const APTITUDE_BLOCKS: ScenarioAnswerBlock[] = [
  "directAnswer",
  "ability",
  "suitableRole",
  "workingEnvironment",
  "caution",
  "nextAction",
];

/**
 * Month-thirds generalFlow template.
 * 시간 구조 분기에서는 month 경로가 이 목록을 재사용한다.
 * 무조건 제거하지 않는다.
 */
const GENERAL_FLOW_BLOCKS: ScenarioAnswerBlock[] = [
  "periodOverview",
  "earlyPeriod",
  "middlePeriod",
  "latePeriod",
  "opportunity",
  "pressure",
  "moneyOrDomainEffect",
  "caution",
];

const ACTION_DECISION_BLOCKS: ScenarioAnswerBlock[] = [
  "directAnswer",
  "currentDirection",
  "conditions",
  "risk",
  "scale",
  "timing",
  "nextAction",
];

const RELATIONSHIP_BLOCKS: ScenarioAnswerBlock[] = [
  "directAnswer",
  "connection",
  "conflict",
  "compatibilityConditions",
  "caution",
];

const POSSIBILITY_BLOCKS: ScenarioAnswerBlock[] = [
  "directAnswer",
  "possibility",
  "supportingEvidence",
  "limitingFactors",
  "conditions",
  "caution",
];

const INTERPRETATION_BLOCKS: ScenarioAnswerBlock[] = [
  "mainInterpretation",
  "humanContext",
  "timeContext",
  "change",
  "evidence",
];

const TIMING_BLOCKS: ScenarioAnswerBlock[] = [
  "directAnswer",
  "timing",
  "opportunity",
  "pressure",
  "risk",
  "conditions",
  "caution",
];

const SCENARIO_QUESTION_BLOCKS: Record<
  ConsultingScenarioType,
  ScenarioAnswerBlock[]
> = {
  aptitudeRecommendation: APTITUDE_BLOCKS,
  generalFlow: GENERAL_FLOW_BLOCKS,
  actionDecision: ACTION_DECISION_BLOCKS,
  relationshipAssessment: RELATIONSHIP_BLOCKS,
  possibilityCheck: POSSIBILITY_BLOCKS,
  interpretation: INTERPRETATION_BLOCKS,
  timingAssessment: TIMING_BLOCKS,
  specificEvent: TIMING_BLOCKS,
};

const REPORT_SECTIONS_BASE = [
  "humanState",
  "timeState",
  "changeSignals",
  "assessment",
  "conclusion",
] as const;

function hasSignalType(
  changeSignals: readonly ChangeSignal[] | undefined,
  signalType: ChangeSignalType,
): boolean {
  return (changeSignals ?? []).some(
    (signal) => signal.type === signalType,
  );
}

function buildEmphasisFromSignals(
  changeSignals: readonly ChangeSignal[] | undefined,
): string[] {
  const emphasis: string[] = [];

  if (hasSignalType(changeSignals, "opportunity")) {
    emphasis.push("opportunity");
  }

  if (hasSignalType(changeSignals, "pressure")) {
    emphasis.push("pressure");
  }

  if (hasSignalType(changeSignals, "risk")) {
    emphasis.push("risk");
  }

  if (hasSignalType(changeSignals, "inflow")) {
    emphasis.push("inflow");
  }

  if (hasSignalType(changeSignals, "expense")) {
    emphasis.push("expense");
  }

  if (hasSignalType(changeSignals, "relationshipChange")) {
    emphasis.push("relationshipChange");
  }

  return emphasis;
}

function buildScenarioEmphasis(
  input: AnswerBlueprintBuilderInput,
): string[] {
  const emphasis = buildEmphasisFromSignals(input.changeSignals);

  if (input.scenario.missingContext.length > 0) {
    emphasis.push("missingContext");
  }

  if (input.assessment?.conditions.some(
    (condition) => condition.required && !condition.satisfied,
  )) {
    emphasis.push("unsatisfiedConditions");
  }

  if (input.assessment?.risks.some(
    (risk) => risk.severity === "high",
  )) {
    emphasis.push("highRisk");
  }

  return emphasis;
}

function filterBlocksForMissingContext(
  blocks: ScenarioAnswerBlock[],
  scenario: ConsultingScenario,
): ScenarioAnswerBlock[] {
  if (scenario.missingContext.length === 0) {
    return blocks;
  }

  return blocks.filter((block) =>
    block !== "compatibilityConditions"
    && block !== "connection",
  );
}

function shouldIncludePossibilityTiming(
  scenario: ConsultingScenario,
  questionMeaning: QuestionMeaning,
): boolean {
  return (
    scenario.type === "possibilityCheck"
    && (
      scenario.requiredTimeGranularity.length > 0
      || questionMeaning.time.urgency !== "unspecified"
      || questionMeaning.time.timingType !== "unspecified"
      || Boolean(questionMeaning.time.description)
    )
  );
}

function resolveGeneralFlowQuestionBlocks(
  questionMeaning: QuestionMeaning,
): {
  blocks: ScenarioAnswerBlock[];
  flowTimeStructure: GeneralFlowTimeStructure;
} {
  const flowTimeStructure = resolveGeneralFlowTimeStructure(
    questionMeaning,
  );

  return {
    blocks: resolveGeneralFlowBlocks(flowTimeStructure),
    flowTimeStructure,
  };
}

function resolveQuestionBlocks(
  scenario: ConsultingScenario,
  questionMeaning: QuestionMeaning,
): {
  blocks: ScenarioAnswerBlock[];
  flowTimeStructure?: GeneralFlowTimeStructure;
} {
  if (scenario.type === "generalFlow") {
    return resolveGeneralFlowQuestionBlocks(questionMeaning);
  }

  const baseBlocks = [...SCENARIO_QUESTION_BLOCKS[scenario.type]];

  if (shouldIncludePossibilityTiming(scenario, questionMeaning)) {
    return { blocks: [...baseBlocks, "timing"] };
  }

  return { blocks: baseBlocks };
}

function buildQuestionBlueprint(
  input: AnswerBlueprintBuilderInput,
): AnswerBlueprint {
  const resolved = resolveQuestionBlocks(
    input.scenario,
    input.questionMeaning,
  );
  const blocks = filterBlocksForMissingContext(
    resolved.blocks,
    input.scenario,
  );

  return {
    mode: "question",
    scenarioType: input.scenario.type,
    blocks,
    emphasis: buildScenarioEmphasis(input),
    ...(resolved.flowTimeStructure
      ? { flowTimeStructure: resolved.flowTimeStructure }
      : {}),
  };
}

function buildReportBlueprint(
  input: AnswerBlueprintBuilderInput,
): AnswerBlueprint {
  const sections = [...REPORT_SECTIONS_BASE].filter((section) => {
    if (
      section === "changeSignals"
      && input.scenario.requiredSignals.length === 0
    ) {
      return false;
    }

    if (
      section === "timeState"
      && input.scenario.requiredTimeGranularity.length === 0
    ) {
      return false;
    }

    return true;
  });

  return {
    mode: "report",
    scenarioType: input.scenario.type,
    sections,
    emphasis: buildScenarioEmphasis(input),
  };
}

/**
 * Scenario와 분석 결과를 바탕으로
 * "무엇을 어떤 순서로 설명할지"만 결정한다.
 * 사주 판단이나 고정 답변 문장을 생성하지 않는다.
 */
export function buildAnswerBlueprint(
  input: AnswerBlueprintBuilderInput,
): AnswerBlueprint {
  if (input.answerMode === "report") {
    return buildReportBlueprint(input);
  }

  return buildQuestionBlueprint(input);
}

export function resolveScenarioQuestionBlocks(
  scenarioType: ConsultingScenarioType,
): ScenarioAnswerBlock[] {
  return [...SCENARIO_QUESTION_BLOCKS[scenarioType]];
}
