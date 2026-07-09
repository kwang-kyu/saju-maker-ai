import type { IntentAnalysisResult } from "./intentAnalyzer";

export type ConsultingStrategy = {
  intent: string;
  purpose: string;
  primaryCore?: string;
  supportingCores: string[];
  sections: string[];
};

export function buildConsultingStrategy(
  intentAnalysis: IntentAnalysisResult
): ConsultingStrategy {
  const [primaryCore, ...supportingCores] = intentAnalysis.requiredCores;

  return {
    intent: intentAnalysis.intent,
    purpose: intentAnalysis.purpose,
    primaryCore,
    supportingCores,
    sections: resolveSections(intentAnalysis.intent),
  };
}

function resolveSections(intent: string): string[] {
  switch (intent) {
    case "business":
      return [
        "currentSituation",
        "strengths",
        "risks",
        "timing",
        "recommendedStrategies",
      ];

    case "money":
      return [
        "moneyType",
        "investmentDecision",
        "risks",
        "timing",
        "recommendedStrategies",
      ];

    case "love":
      return [
        "loveType",
        "matchingPartner",
        "conflictPoint",
        "timing",
      ];

    case "marriage":
      return [
        "marriageType",
        "stability",
        "financialView",
        "timing",
      ];

    default:
      return [];
  }
}