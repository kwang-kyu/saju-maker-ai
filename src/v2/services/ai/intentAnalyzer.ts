import { analyzeScenario } from "./scenarioMap";
import { classifyQuestion } from "./questionClassifier";

export type IntentAnalysisResult = {
  question: string;
  questionType: ReturnType<typeof classifyQuestion>;
  scenario: ReturnType<typeof analyzeScenario>;
  intent: string;
  requiredCores: string[];
  needsFollowUp: boolean;
};

export function analyzeIntent(question: string): IntentAnalysisResult {
  const questionType = classifyQuestion(question);
  const scenario = analyzeScenario(question);

  return {
    question,
    questionType,
    scenario,
    intent: scenario.intent,
    requiredCores: scenario.requiredCores,
    needsFollowUp: questionType.topic === "general",
  };
}