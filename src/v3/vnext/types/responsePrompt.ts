/**
 * vNext Response Prompt 계약.
 *
 * GPT 호출 직전의 최소 Prompt 구조. AnalysisResult 전체를 전달하지 않는다.
 */

import type {
  AnswerMode,
} from "./answerBlueprint.js";
import type {
  ConsultingScenarioType,
} from "./consultingScenario.js";

export type ConversationStyle =
  | "conversational"
  | "consulting"
  | "decisionSupport"
  | "analyticalReport";

export type PromptBudgetLevel = "minimal" | "standard" | "detailed";

/**
 * 상담 방식 전략 — ResponseContext를 그대로 Prompt로 만들지 않고 먼저 결정한다.
 */
export type PromptStrategy = {
  answerMode: AnswerMode;
  scenario: ConsultingScenarioType;
  conversationStyle: ConversationStyle;
  answerGoal: string;
  requiredBlocks: string[];
  forbiddenPatterns: string[];
  verbosityLevel: PromptBudgetLevel;
};

/** GPT가 이해하기 쉬운 작은 Prompt Section */
export type PromptSection = {
  id: string;
  title: string;
  content: string;
  blockIds: string[];
  priority: number;
};

/** 최종 GPT Prompt */
export type ResponsePrompt = {
  systemInstruction: string;
  userPrompt: string;
  metadata: {
    answerMode: AnswerMode;
    scenario: ConsultingScenarioType;
    budget: PromptBudgetLevel;
    selectedBlockIds: string[];
    estimatedSize: number;
    conversationStyle: ConversationStyle;
  };
};
