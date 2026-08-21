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
      const hiddenStems =
        HIDDEN_STEMS[branch] ?? [];
  
      if (
        hiddenStems.includes(
          input.dayStem,
        )
      ) {
        rootingCount += 1;
      }
    }
  
    if (rootingCount >= 3) {
      return {
        category: "rooting",
        description:
          "일간이 여러 지지에 통근하고 있다.",
        strength: "strong",
        confidence: "strong",
        evidence: [
          `네 지지 중 ${rootingCount}곳에서 일간과 같은 천간이 지장간으로 확인된다.`,
        ],
        signal: {
          kind: "rooting",
          rootingCount,
          totalBranches: 4,
          rooted: true,
        },
      };
    }
  
    if (rootingCount >= 1) {
      return {
        category: "rooting",
        description:
          "일간이 일부 지지에 통근하고 있다.",
        strength: "medium",
        confidence: "strong",
        evidence: [
          `네 지지 중 ${rootingCount}곳에서 일간과 같은 천간이 지장간으로 확인된다.`,
        ],
        signal: {
          kind: "rooting",
          rootingCount,
          totalBranches: 4,
          rooted: true,
        },
      };
    }
  
    return {
      category: "rooting",
      description:
        "일간과 같은 천간이 지장간에서 확인되지 않는다.",
      strength: "weak",
      confidence: "strong",
      evidence: [
        "년지·월지·일지·시지의 지장간에서 일간과 같은 천간이 확인되지 않는다.",
      ],
      signal: {
        kind: "rooting",
        rootingCount: 0,
        totalBranches: 4,
        rooted: false,
      },
    };
  }
    
  
