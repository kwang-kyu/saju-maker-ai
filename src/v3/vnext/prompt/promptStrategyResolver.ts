/**
 * vNext Prompt Strategy Resolver.
 *
 * ResponseContext를 그대로 Prompt로 만들지 않고 상담 방식을 먼저 결정한다.
 */

import {
  resolveGeneralFlowAnswerGoal,
} from "../blueprint/generalFlowTimeStructure.js";
import {
  resolveBlueprintBlockIds,
} from "../response/responseEvidenceSelector.js";
import type {
  AnswerBlueprint,
  GeneralFlowTimeStructure,
} from "../types/answerBlueprint.js";
import type {
  ConsultingScenarioType,
} from "../types/consultingScenario.js";
import type {
  ConversationStyle,
  PromptStrategy,
} from "../types/responsePrompt.js";
import type {
  ResponseContext,
} from "../response/responseContext.js";

type ScenarioStrategyProfile = {
  conversationStyle: ConversationStyle;
  answerGoal: string;
  forbiddenPatterns: string[];
};

const SCENARIO_STRATEGY_PROFILES: Record<
  ConsultingScenarioType,
  ScenarioStrategyProfile
> = {
  aptitudeRecommendation: {
    conversationStyle: "conversational",
    answerGoal: "역할과 적성을 자연스럽게 설명한다.",
    forbiddenPatterns: [
      "직업명 단정 나열",
      "무조건적인 직업 추천",
    ],
  },
  generalFlow: {
    conversationStyle: "conversational",
    // month 기본값. resolveAnswerGoal이 flowTimeStructure로 덮어쓴다.
    answerGoal: "시간 흐름을 초순/중순/말로 구분해 설명한다.",
    forbiddenPatterns: [
      "재무 일반론 자동 삽입",
      "무조건적인 금전 단정",
    ],
  },
  specificEvent: {
    conversationStyle: "decisionSupport",
    answerGoal: "특정 사건의 가능성, 조건, 위험, 시기를 설명한다.",
    forbiddenPatterns: [
      "사건 결과 단정",
      "무조건 추천 / 무조건 금지",
    ],
  },
  actionDecision: {
    conversationStyle: "decisionSupport",
    answerGoal: "결론, 조건, 위험, 시기를 이해하기 쉽게 설명한다.",
    forbiddenPatterns: [
      "무조건 추천",
      "무조건 금지",
    ],
  },
  relationshipAssessment: {
    conversationStyle: "consulting",
    answerGoal: "관계 연결, 충돌, 조율 조건을 설명한다.",
    forbiddenPatterns: [
      "관계 결과 단정",
      "상대방 성격 단정",
    ],
  },
  possibilityCheck: {
    conversationStyle: "conversational",
    answerGoal: "가능성과 제한 조건을 설명한다.",
    forbiddenPatterns: [
      "가능/불가능 단정",
    ],
  },
  timingAssessment: {
    conversationStyle: "conversational",
    answerGoal: "시기와 흐름의 차이를 설명한다.",
    forbiddenPatterns: [
      "특정 날짜 단정",
    ],
  },
  interpretation: {
    conversationStyle: "consulting",
    answerGoal: "의미와 변화를 설명한다.",
    forbiddenPatterns: [
      "새로운 해석 창작",
    ],
  },
};

function resolveConversationStyle(
  context: ResponseContext,
): ConversationStyle {
  if (context.answerMode === "report") {
    return "analyticalReport";
  }

  return SCENARIO_STRATEGY_PROFILES[context.scenario].conversationStyle;
}

function readFlowTimeStructure(
  blueprint: AnswerBlueprint,
): GeneralFlowTimeStructure | undefined {
  if (
    blueprint.mode === "question"
    && "flowTimeStructure" in blueprint
    && blueprint.flowTimeStructure
  ) {
    return blueprint.flowTimeStructure;
  }

  return undefined;
}

function inferGeneralFlowStructureFromBlocks(
  requiredBlocks: readonly string[],
): GeneralFlowTimeStructure {
  if (
    requiredBlocks.includes("earlyPeriod")
    || requiredBlocks.includes("middlePeriod")
    || requiredBlocks.includes("latePeriod")
  ) {
    return "month";
  }

  return "overview";
}

function resolveAnswerGoal(
  context: ResponseContext,
  profile: ScenarioStrategyProfile,
  requiredBlocks: readonly string[],
): string {
  if (context.answerMode === "report") {
    return "Blueprint sections를 유지하며 분석 보고서형으로 설명한다.";
  }

  if (context.scenario === "generalFlow") {
    const structure = readFlowTimeStructure(context.blueprint)
      ?? inferGeneralFlowStructureFromBlocks(requiredBlocks);

    return resolveGeneralFlowAnswerGoal(structure);
  }

  return profile.answerGoal;
}

/**
 * ResponseContext로 PromptStrategy를 결정한다.
 */
export function resolvePromptStrategy(
  context: ResponseContext,
): PromptStrategy {
  const profile = SCENARIO_STRATEGY_PROFILES[context.scenario];
  const requiredBlocks = resolveBlueprintBlockIds(context.blueprint);

  return {
    answerMode: context.answerMode,
    scenario: context.scenario,
    conversationStyle: resolveConversationStyle(context),
    answerGoal: resolveAnswerGoal(context, profile, requiredBlocks),
    requiredBlocks,
    forbiddenPatterns: context.answerMode === "report"
      ? ["원본 JSON 데이터 나열"]
      : profile.forbiddenPatterns,
    verbosityLevel: "standard",
  };
}
