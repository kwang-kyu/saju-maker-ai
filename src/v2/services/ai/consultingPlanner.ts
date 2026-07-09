export type ConsultingPlan = {
    purpose: string;
    requiredCores: string[];
    answerOrder: string[];
    emphasis: string[];
  };
  
  export function buildConsultingPlan(
    intent: string,
    purpose: string
  ): ConsultingPlan {
    void intent;
  
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
          emphasis: [
            "timing",
            "cashflow",
            "execution",
          ],
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
          emphasis: [
            "people",
            "contract",
          ],
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