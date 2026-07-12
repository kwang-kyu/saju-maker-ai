import type {
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  export type TenGodStructureCalculatorInput = {
    yearTenGod?: string;
    monthTenGod?: string;
    timeTenGod?: string;
  };
  
  export function calculateTenGodStructure(
    input: TenGodStructureCalculatorInput,
  ): SajuStructureFact {
    const gods = [
      input.yearTenGod,
      input.monthTenGod,
      input.timeTenGod,
    ].filter(Boolean) as string[];
  
    if (!gods.length) {
      return {
        category: "tenGodStrength",
        description:
          "십성 정보를 확인할 수 없다.",
        strength: "weak",
        confidence: "weak",
      };
    }
  
    const counts = new Map<string, number>();
  
    for (const god of gods) {
      counts.set(
        god,
        (counts.get(god) ?? 0) + 1,
      );
    }
  
    let dominantGod = "";
    let dominantCount = 0;
  
    for (const [god, count] of counts) {
      if (count > dominantCount) {
        dominantGod = god;
        dominantCount = count;
      }
    }
  
    const strength =
      dominantCount >= 2
        ? "strong"
        : "medium";
  
    return {
      category: "tenGodStrength",
      description: `십성 구조에서 ${dominantGod}의 영향이 가장 두드러진다.`,
      strength,
      confidence: "strong",
    };
  }