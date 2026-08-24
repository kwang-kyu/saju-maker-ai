import type { LifeDriverType } from "../types/lifeDriver.js";

export type LifeDriverDefinition = {
  type: LifeDriverType;
  label: string;
  description: string;
  activationKeywords: string[];
  riskKeywords: string[];
};

export const LIFE_DRIVER_DEFINITIONS: LifeDriverDefinition[] = [
  {
    type: "achievement",
    label: "성취형",
    description: "목표, 경쟁, 결과, 확장을 통해 삶의 동력을 얻는 유형",
    activationKeywords: ["목표", "경쟁", "성과", "도전", "확장"],
    riskKeywords: ["과속", "무리한 확장", "승부 집착"],
  },
  {
    type: "wealth",
    label: "재물형",
    description: "재물의 획득, 운용, 축적을 통해 삶의 동력을 얻는 유형",
    activationKeywords: ["수익", "축적", "운용", "현금흐름", "자산"],
    riskKeywords: ["과도한 투자", "탐욕", "현금흐름 악화"],
  },
  {
    type: "knowledge",
    label: "지식형",
    description: "학습, 연구, 기술, 전문성 축적을 통해 성장하는 유형",
    activationKeywords: ["공부", "연구", "기술", "전문성", "자격"],
    riskKeywords: ["과도한 고민", "실행 지연", "현실과 분리"],
  },
  {
    type: "creation",
    label: "창조형",
    description: "표현, 생산, 기획, 콘텐츠 창출을 통해 성장하는 유형",
    activationKeywords: ["표현", "생산", "기획", "콘텐츠", "창작"],
    riskKeywords: ["산만함", "완성도 저하", "지속성 부족"],
  },
  {
    type: "leadership",
    label: "주도형",
    description: "책임, 결정권, 통솔을 맡을 때 힘이 살아나는 유형",
    activationKeywords: ["책임", "결정", "통솔", "대표", "권한"],
    riskKeywords: ["독단", "과도한 책임", "통제 집착"],
  },
  {
    type: "relationship",
    label: "관계형",
    description: "사람, 고객, 파트너, 인맥을 통해 기회를 만드는 유형",
    activationKeywords: ["인맥", "고객", "소개", "협력", "파트너"],
    riskKeywords: ["사람 의존", "관계 손실", "경계 부족"],
  },
  {
    type: "freedom",
    label: "자유형",
    description: "자율성, 독립성, 자기 방식이 보장될 때 힘이 살아나는 유형",
    activationKeywords: ["자율", "독립", "자기 방식", "시간 자유", "공간 자유"],
    riskKeywords: ["고립", "조직 부적응", "책임 회피"],
  },
  {
    type: "stability",
    label: "안정형",
    description: "유지, 반복, 관리, 축적을 통해 성장하는 유형",
    activationKeywords: ["유지", "반복", "관리", "축적", "안정"],
    riskKeywords: ["변화 회피", "기회 상실", "과도한 보수성"],
  },
];

export function getLifeDriverDefinition(
  type: LifeDriverType,
): LifeDriverDefinition {
  const definition = LIFE_DRIVER_DEFINITIONS.find(
    (item) => item.type === type,
  );

  if (!definition) {
    throw new Error(`Unknown life driver type: ${type}`);
  }

  return definition;
}