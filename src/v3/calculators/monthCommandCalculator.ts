import type {
    SajuFiveElement,
    SajuStructureFact,
  } from "../types/sajuFacts.js";
  
  export type MonthCommandCalculatorInput = {
    monthBranch: string;
    dayMasterElement: SajuFiveElement;
  };
  
  type Season =
    | "spring"
    | "summer"
    | "autumn"
    | "winter";
  
  const MONTH_BRANCH_SEASON: Record<string, Season> = {
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
    Season[]
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
            "월령을 판정할 수 없습니다.",
          strength: "weak",
          confidence: "weak",
          signal: {
            kind: "monthCommand",
            season: null,
            supported: null,
            dayMasterElement:
              input.dayMasterElement,
          },
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
            "월령이 일간을 생조하는 계절입니다.",
          strength: "strong",
          confidence: "strong",
          signal: {
            kind: "monthCommand",
            season,
            supported: true,
            dayMasterElement:
              input.dayMasterElement,
          },
        };
      }
  
      return {
        category: "monthCommand",
        description:
          "월령이 일간을 직접 생조하지 않는 계절입니다.",
        strength: "weak",
        confidence: "medium",
        signal: {
          kind: "monthCommand",
          season,
          supported: false,
          dayMasterElement:
            input.dayMasterElement,
        },
      };
    }