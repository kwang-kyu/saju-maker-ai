import type {
    SajuStructureFact,
  } from "../types/sajuFacts.js";
  
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
          evidence: [
            "년간·월간·시간에서 확인 가능한 십성 값이 없다.",
          ],
          signal: {
            kind: "tenGodDominance",
            dominantTenGod: null,
            dominantCount: 0,
            totalCount: 0,
            counts: {},
            distributed: true,
          },
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
  
    const distribution = [...counts.entries()]
      .map(
        ([god, count]) =>
          `${god} ${count}회`,
      )
      .join(", ");
  
      return {
        category: "tenGodStrength",
        description:
          dominantCount >= 2
            ? `십성 구조에서 ${dominantGod}이 반복해서 나타난다.`
            : "확인된 십성이 서로 분산되어 있다.",
        strength,
        confidence: "strong",
        evidence: [
          `확인된 십성 분포는 ${distribution}이다.`,
          `가장 많이 나타난 십성은 ${dominantGod}이며 ${dominantCount}회 확인된다.`,
        ],
        signal: {
          kind: "tenGodDominance",
          dominantTenGod: dominantGod || null,
          dominantCount,
          totalCount: gods.length,
          counts: Object.fromEntries(counts),
          distributed: dominantCount < 2,
        },
      };
    }