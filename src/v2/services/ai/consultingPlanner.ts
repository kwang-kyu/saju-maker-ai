import type { IntentAnalysisResult } from "./intentAnalyzer";

export type ConsultingPlan = {
  intent: string;
  purpose: string;
  requiredCores: string[];
  confidence: number;
  needsFollowUp: boolean;
  flow: string[];
};

export function buildConsultingPlan(
  intentAnalysis: IntentAnalysisResult
): ConsultingPlan {
  const flow: string[] = [
    "questionUnderstanding",
    "coreJudgement",
    "practicalInterpretation",
    "strategy",
    "finalAnswer",
  ];

  if (intentAnalysis.needsFollowUp) {
    flow.splice(3, 0, "followUpGuide");
  }

  return {
    intent: intentAnalysis.intent,
    purpose: intentAnalysis.purpose,
    requiredCores: intentAnalysis.requiredCores,
    confidence: intentAnalysis.confidence,
    needsFollowUp: intentAnalysis.needsFollowUp,
    flow,
  };
}