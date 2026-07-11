import type { LifeDriverType } from "../types/lifeDriver";
import type {
  LifeDriverEvidenceSource,
  LifeDriverMeaning,
} from "../types/lifeDriverInput";

export type LifeDriverRule = {
  id: string;
  source: LifeDriverEvidenceSource;
  keywords: string[];
  driver: LifeDriverType;
  weight: number;
  reason: string;
};

export const LIFE_DRIVER_RULES: LifeDriverRule[] = [
  {
    id: "achievement-goal",
    source: "structure",
    keywords: ["목표", "성과", "경쟁", "도전", "확장"],
    driver: "achievement",
    weight: 3,
    reason: "성과와 목표 달성이 삶의 동력으로 작동하는 구조",
  },
  {
    id: "wealth-flow",
    source: "tenGodStrength",
    keywords: ["재물", "수익", "현금흐름", "축적", "자산"],
    driver: "wealth",
    weight: 3,
    reason: "재물의 획득과 운용이 핵심 동력으로 작동하는 구조",
  },
  {
    id: "knowledge-learning",
    source: "tenGodStrength",
    keywords: ["학습", "연구", "지식", "전문성", "기술"],
    driver: "knowledge",
    weight: 3,
    reason: "지식과 전문성 축적을 통해 성장하는 구조",
  },
  {
    id: "creation-expression",
    source: "tenGodStrength",
    keywords: ["표현", "생산", "창작", "기획", "콘텐츠"],
    driver: "creation",
    weight: 3,
    reason: "표현과 결과물 생산이 삶의 동력으로 작동하는 구조",
  },
  {
    id: "leadership-responsibility",
    source: "structure",
    keywords: ["책임", "통솔", "결정권", "권한", "대표"],
    driver: "leadership",
    weight: 3,
    reason: "책임과 의사결정권을 맡을 때 힘이 살아나는 구조",
  },
  {
    id: "relationship-connection",
    source: "interaction",
    keywords: ["관계", "인맥", "협력", "소개", "고객", "파트너"],
    driver: "relationship",
    weight: 3,
    reason: "사람과의 연결을 통해 기회가 만들어지는 구조",
  },
  {
    id: "freedom-independence",
    source: "dayMasterStrength",
    keywords: ["독립", "자율", "자기 방식", "간섭", "통제"],
    driver: "freedom",
    weight: 3,
    reason: "자율성과 독립성이 보장될 때 힘이 살아나는 구조",
  },
  {
    id: "stability-accumulation",
    source: "fiveElementFlow",
    keywords: ["안정", "유지", "반복", "관리", "축적"],
    driver: "stability",
    weight: 3,
    reason: "반복과 축적을 통해 안정적으로 성장하는 구조",
  },
];

export type MatchedLifeDriverRule = {
  rule: LifeDriverRule;
  meaning: LifeDriverMeaning;
};

export function matchLifeDriverRules(
  meanings: LifeDriverMeaning[],
): MatchedLifeDriverRule[] {
  const matched: MatchedLifeDriverRule[] = [];

  for (const meaning of meanings) {
    for (const rule of LIFE_DRIVER_RULES) {
      if (rule.source !== meaning.source) {
        continue;
      }

      const hasKeyword = rule.keywords.some((keyword) =>
        meaning.meaning.includes(keyword),
      );

      if (hasKeyword) {
        matched.push({
          rule,
          meaning,
        });
      }
    }
  }

  return matched;
}