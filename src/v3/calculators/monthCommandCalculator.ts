import type {
    SajuFiveElement,
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  export type MonthCommandCalculatorInput = {
    monthBranch: string;
    dayMasterElement: SajuFiveElement;
  };
  
  const MONTH_BRANCH_SEASON: Record<
    string,
    "spring" | "summer" | "autumn" | "winter"
  > = {
    寅: "spring",
    卯: "spring",
    辰: "spring",
  
    巳: "summer",
    午: "summer",
    未: "summer",
  
    申: "autumn",
    酉: "autumn",
    戌: "autumn",
  
    亥: "winter",
    子: "winter",
    丑: "winter",
  };
  
  const FAVORABLE_SEASON: Record<
    SajuFiveElement,
    ("spring" | "summer" | "autumn" | "winter")[]
  > = {
    wood: ["spring"],
    fire: ["summer"],
    earth: ["summer"],
    metal: ["autumn"],
    water: ["winter"],
  };
  
  export function calculateMonthCommand(
    input: MonthCommandCalculatorInput,
  ): SajuStructureFact {
    const season =
      MONTH_BRANCH_SEASON[input.monthBranch];
  
    if (!season) {
      return {
        category: "monthCommand",
        description:
          "월령을 판정할 수 없는 월지입니다.",
        strength: "weak",
        confidence: "weak",
      };
    }
  
    const supported =
      FAVORABLE_SEASON[
        input.dayMasterElement
      ].includes(season);
  
    if (supported) {
      return {
        category: "monthCommand",
        description:
          "월령이 일간을 생조하는 계절에 위치하여 기본적인 계절의 도움을 받는다.",
        strength: "strong",
        confidence: "strong",
      };
    }
  
    return {
      category: "monthCommand",
      description:
        "월령이 일간을 직접 생조하지 않는 계절에 위치하여 계절적 지원은 제한적이다.",
      strength: "weak",
      confidence: "medium",
    };
  }