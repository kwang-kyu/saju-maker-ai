import type {
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  export type RootingCalculatorInput = {
    dayStem: string;
    yearBranch: string;
    monthBranch: string;
    dayBranch: string;
    timeBranch: string;
  };
  
  const HIDDEN_STEMS: Record<string, string[]> = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "戊", "庚"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"],
  };
  
  export function calculateRooting(
    input: RootingCalculatorInput,
  ): SajuStructureFact {
    const branches = [
      input.yearBranch,
      input.monthBranch,
      input.dayBranch,
      input.timeBranch,
    ];
  
    let rootingCount = 0;
  
    for (const branch of branches) {
      const hiddenStems = HIDDEN_STEMS[branch] ?? [];
  
      if (hiddenStems.includes(input.dayStem)) {
        rootingCount++;
      }
    }
  
    if (rootingCount >= 3) {
      return {
        category: "rooting",
        description:
          "일간이 여러 지지에 통근하여 기반이 매우 안정적이다.",
        strength: "strong",
        confidence: "strong",
      };
    }
  
    if (rootingCount >= 1) {
      return {
        category: "rooting",
        description:
          "일간이 일부 지지에 통근하여 기본적인 기반을 갖추고 있다.",
        strength: "medium",
        confidence: "strong",
      };
    }
  
    return {
      category: "rooting",
      description:
        "일간이 지지에 통근하지 않아 기반이 약한 구조이다.",
      strength: "weak",
      confidence: "medium",
    };
  }