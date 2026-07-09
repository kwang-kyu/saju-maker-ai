export type ConsultingPlan = {
    purpose: string;
    requiredCores: string[];
    answerOrder: string[];
    emphasis: string[];
  };
  
  function buildDefaultPlanByIntent(
    intent: string,
    purpose: string
  ): ConsultingPlan {
    switch (intent) {
      case "business":
        return {
          purpose,
          requiredCores: ["business"],
          answerOrder: [
            "currentSituation",
            "strengths",
            "risks",
            "timing",
            "recommendedStrategies",
          ],
          emphasis: ["business", "timing", "execution"],
        };
  
      case "money":
        return {
          purpose,
          requiredCores: ["money"],
          answerOrder: [
            "currentSituation",
            "moneyType",
            "investmentDecision",
            "risks",
            "recommendedStrategies",
          ],
          emphasis: ["cashflow", "risk", "stability"],
        };
  
      case "love":
        return {
          purpose,
          requiredCores: ["love"],
          answerOrder: [
            "currentSituation",
            "loveType",
            "matchingPartner",
            "conflictPoint",
            "timing",
          ],
          emphasis: ["relationship", "expression", "conflict"],
        };
  
      case "marriage":
        return {
          purpose,
          requiredCores: ["marriage"],
          answerOrder: [
            "currentSituation",
            "marriageType",
            "stability",
            "financialView",
            "longTermStability",
          ],
          emphasis: ["stability", "partner", "family"],
        };
  
      default:
        return {
          purpose,
          requiredCores: [],
          answerOrder: [],
          emphasis: [],
        };
    }
  }
  
  export function buildConsultingPlan(
    intent: string,
    purpose: string
  ): ConsultingPlan {
    switch (purpose) {
      case "startBusiness":
        return {
          purpose,
          requiredCores: ["business", "money"],
          answerOrder: [
            "currentSituation",
            "strengths",
            "timing",
            "risks",
            "recommendedStrategies",
          ],
          emphasis: ["timing", "cashflow", "execution"],
        };
  
      case "partnership":
        return {
          purpose,
          requiredCores: ["business", "marriage"],
          answerOrder: [
            "partnership",
            "risks",
            "conflictPoint",
            "recommendedStrategies",
          ],
          emphasis: ["people", "contract", "conflict"],
        };
  
      default:
        return buildDefaultPlanByIntent(intent, purpose);
    }
  }