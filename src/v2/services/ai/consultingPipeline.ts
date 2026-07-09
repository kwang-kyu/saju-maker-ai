import { analyzeIntent } from "./intentAnalyzer";
import { buildAnswerPlan } from "./answerPlanner";
import { ConversationContext } from "./conversationContext";

export type ConsultingPipelineResult = {
  question: string;
  intent: string;
  requiredCores: string[];
  hasPreviousConversation: boolean;
  previousQuestion?: string;
  opening: string;
  answerFlow: string[];
  closing: string;
};

const conversationContext = new ConversationContext();

export function runConsultingPipeline(question: string): ConsultingPipelineResult {
  const intentAnalysis = analyzeIntent(question);
  const answerPlan = buildAnswerPlan(intentAnalysis);
  const lastTurn = conversationContext.getLastTurn();

  conversationContext.addTurn(intentAnalysis, answerPlan);

  return {
    question,
    intent: intentAnalysis.intent,
    requiredCores: intentAnalysis.requiredCores,
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