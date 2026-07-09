import { analyzeScenario } from "./scenarioMap";
import { classifyQuestion } from "./questionClassifier";

export type IntentAnalysisResult = {
  question: string;
  questionType: ReturnType<typeof classifyQuestion>;
  scenario: ReturnType<typeof analyzeScenario>;
  intent: string;
  purpose: string;
  requiredCores: string[];
  confidence: number;
  needsFollowUp: boolean;
};

function inferPurpose(scenario: ReturnType<typeof analyzeScenario>): string {
  if (scenario.topic === "business" && scenario.intent === "timing") {
    return "startBusiness";
  }

  if (scenario.topic === "business") {
    return "businessJudgement";
  }

  if (scenario.topic === "money" && scenario.intent === "timing") {
    return "moneyTiming";
  }

  if (scenario.topic === "money") {
    return "moneyJudgement";
  }

  if (scenario.topic === "love") {
    return "loveJudgement";
  }

  if (scenario.topic === "marriage") {
    return "marriageTiming";
  }

  if (scenario.topic === "compatibility") {
    return "compatibilityJudgement";
  }

  if (scenario.topic === "lifeTimeline") {
    return "lifeTimeline";
  }

  return "generalConsulting";
}

function inferConfidence(scenario: ReturnType<typeof analyzeScenario>): number {
  if (scenario.topic === "general") {
    return 0.4;
  }

  if (scenario.keywords.length >= 3) {
    return 0.9;
  }

  return 0.75;
}

export function analyzeIntent(question: string): IntentAnalysisResult {
  const questionType = classifyQuestion(question);
  const scenario = analyzeScenario(question);

  return {
    question,
    questionType,
    scenario,
    intent: scenario.topic,
    purpose: inferPurpose(scenario),
    requiredCores: scenario.requiredCores,
    confidence: inferConfidence(scenario),
    needsFollowUp: questionType.topic === "general",
  };
}