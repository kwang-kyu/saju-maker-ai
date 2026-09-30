/**
 * generalFlow 시간 구조 분기.
 *
 * 질문의 time.period / TimeGranularity를
 * AnswerBlueprint 블록 선택과 promptStrategy answerGoal에 연결한다.
 * 새로운 semantic axis를 만들지 않는다.
 */

import type {
  GeneralFlowTimeStructure,
  ScenarioAnswerBlock,
} from "../types/answerBlueprint.js";
import type {
  QuestionMeaning,
} from "../types/questionMeaning.js";
import {
  resolveTimeGranularity,
} from "../routing/scenarioRouter.js";

export type { GeneralFlowTimeStructure };

/**
 * Month-thirds template.
 * GENERAL_FLOW_BLOCKS의 시간 축 부분 — 유지·재사용.
 */
export const GENERAL_FLOW_MONTH_PERIOD_BLOCKS: ScenarioAnswerBlock[] = [
  "periodOverview",
  "earlyPeriod",
  "middlePeriod",
  "latePeriod",
];

const GENERAL_FLOW_EFFECT_BLOCKS: ScenarioAnswerBlock[] = [
  "opportunity",
  "pressure",
  "moneyOrDomainEffect",
  "caution",
];

/**
 * day / year / overview 공통: 초순/중순/말 없이 overview 중심.
 * 기존 GeneralFlowBlock union만 재조합한다.
 */
const GENERAL_FLOW_OVERVIEW_CENTERED_BLOCKS: ScenarioAnswerBlock[] = [
  "periodOverview",
  ...GENERAL_FLOW_EFFECT_BLOCKS,
];

/**
 * 질문 시간 범위를 generalFlow 시간 구조로 해석한다.
 * period.granularity를 최우선으로 보고, 없으면 resolveTimeGranularity를 재사용한다.
 */
export function resolveGeneralFlowTimeStructure(
  questionMeaning: QuestionMeaning,
): GeneralFlowTimeStructure {
  const periodGranularity = questionMeaning.time.period?.granularity;

  if (periodGranularity === "day") {
    return "day";
  }

  if (periodGranularity === "month") {
    return "month";
  }

  if (
    periodGranularity === "year"
    || periodGranularity === "halfYear"
  ) {
    return "year";
  }

  if (periodGranularity === "overall") {
    return "overview";
  }

  const granularities = resolveTimeGranularity(questionMeaning);

  if (granularities.includes("day")) {
    return "day";
  }

  if (granularities.includes("month")) {
    return "month";
  }

  if (
    granularities.includes("year")
    || granularities.includes("period")
  ) {
    return "year";
  }

  if (granularities.includes("life")) {
    return "overview";
  }

  // prediction + actionNature=none + 약한 time → overview 중심.
  // urgency/timingType만 있는 경우도 month-thirds(초순/중순/말)를
  // 강제하지 않는다. day/year는 time.period.granularity가 우선한다.
  if (
    questionMeaning.intent === "prediction"
    && questionMeaning.actionNature === "none"
  ) {
    return "overview";
  }

  return "overview";
}

/**
 * 선택된 시간 구조에 맞는 generalFlow 블록을 반환한다.
 * GENERAL_FLOW_BLOCKS(month)는 제거하지 않고 month 경로에서 재사용한다.
 */
export function resolveGeneralFlowBlocks(
  structure: GeneralFlowTimeStructure,
): ScenarioAnswerBlock[] {
  if (structure === "month") {
    return [
      ...GENERAL_FLOW_MONTH_PERIOD_BLOCKS,
      ...GENERAL_FLOW_EFFECT_BLOCKS,
    ];
  }

  return [...GENERAL_FLOW_OVERVIEW_CENTERED_BLOCKS];
}

/**
 * promptStrategy answerGoal을 시간 구조에 맞춘다.
 * month에서만 초순/중순/말 문구를 사용한다.
 */
export function resolveGeneralFlowAnswerGoal(
  structure: GeneralFlowTimeStructure,
): string {
  switch (structure) {
    case "day":
      return "오늘 중심으로 흐름과 기회·주의점을 설명한다.";
    case "month":
      return "시간 흐름을 초순/중순/말로 구분해 설명한다.";
    case "year":
      return "연간/반기 흐름의 개요와 기회·압력을 설명한다.";
    case "overview":
      return "전체 흐름 개요와 기회·압력을 중심으로 설명한다.";
  }
}
