import type { BasicSajuResult } from "../../types/basic";
import { analyzeIntent } from "./intentAnalyzer";
import { buildAnswerPlan } from "./answerPlanner";
import { ConversationContext } from "./conversationContext";
import { runRequiredCores, type CoreRunResult } from "./coreRunner";
import {
    buildConsultingStrategy,
    type ConsultingStrategy,
  } from "./consultingStrategy";

export type ConsultingPipelineResult = {
  question: string;
  intent: string;
  requiredCores: string[];
  executedCores: CoreRunResult[];
  strategy: ConsultingStrategy;
  hasPreviousConversation: boolean;
  previousQuestion?: string;
  opening: string;
  answerFlow: string[];
  closing: string;
};

const conversationContext = new ConversationContext();

export function runConsultingPipeline(
  question: string,
  basic: BasicSajuResult
): ConsultingPipelineResult {
  const intentAnalysis = analyzeIntent(question);

  const coreResult = runRequiredCores({
    basic,
    intentAnalysis,
  });
  
  const strategy = buildConsultingStrategy(intentAnalysis);
  
  const answerPlan = buildAnswerPlan(intentAnalysis);
  const lastTurn = conversationContext.getLastTurn();

  conversationContext.addTurn(intentAnalysis, answerPlan);

  return {
    question,
    intent: intentAnalysis.intent,
    requiredCores: intentAnalysis.requiredCores,
    executedCores: coreResult.executedCores,
    strategy,
    hasPreviousConversation: Boolean(lastTurn),
    previousQuestion: lastTurn?.question,
    opening: answerPlan.opening,
    answerFlow: answerPlan.answerFlow,
    closing: answerPlan.closing,
  };
}

export function resetConsultingConversation(): void {
  conversationContext.clear();
}