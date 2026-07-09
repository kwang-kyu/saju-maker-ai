export type ConsultingStrategy = {
    sections: string[];
  };
  
  export function buildConsultingStrategy(intent: string): ConsultingStrategy {
    switch (intent) {
      case "business":
        return {
          sections: [
            "currentSituation",
            "strengths",
            "risks",
            "timing",
            "recommendedStrategies",
          ],
        };
  
      case "money":
        return {
          sections: [
            "moneyType",
            "investmentDecision",
            "risks",
            "timing",
            "recommendedStrategies",
          ],
        };
  
      case "love":
        return {
          sections: [
            "loveType",
            "matchingPartner",
            "conflictPoint",
            "timing",
          ],
        };
  
      case "marriage":
        return {
          sections: [
            "marriageType",
            "stability",
            "financialView",
            "timing",
          ],
        };
  
      default:
        return {
          sections: [],
        };
    }
  }