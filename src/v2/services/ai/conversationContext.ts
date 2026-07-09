import type { IntentAnalysisResult } from "./intentAnalyzer";
import type { AnswerPlan } from "./answerPlanner";

export type ConversationTurn = {
  question: string;
  intent: string;
  topic: string;
  requiredCores: string[];
  summary: string;
  timestamp: number;
};

export class ConversationContext {
  private history: ConversationTurn[] = [];

  addTurn(
    intent: IntentAnalysisResult,
    answerPlan: AnswerPlan
  ): void {
    this.history.push({
      question: intent.question,
      intent: intent.intent,
      topic: intent.questionType.topic,
      requiredCores: intent.requiredCores,
      summary: answerPlan.mainFocus,
      timestamp: Date.now(),
    });
  }

  getHistory(): ConversationTurn[] {
    return [...this.history];
  }

  getLastTurn(): ConversationTurn | undefined {
    return this.history[this.history.length - 1];
  }

  hasPreviousConversation(): boolean {
    return this.history.length > 0;
  }

  clear(): void {
    this.history = [];
  }
}