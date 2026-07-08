import type { BasicSajuResult } from "../../../types/basic";
import { analyzeBusiness } from "../../judgement/businessJudgement";

export function buildBusinessSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const judgement = analyzeBusiness(basic);

  return [
    `[사업 심층 상담]

${name}님의 사업운은 단순히 사업을 할 수 있느냐보다 어떤 방식으로 운영할 때 성공 가능성이 높아지는지를 보는 것이 중요합니다.

[현재 사업 흐름]
${judgement.currentSituation}

[사업 강점]
${judgement.strengths.map((item) => `- ${item}`).join("\n")}

[보완해야 할 약점]
${judgement.weaknesses.map((item) => `- ${item}`).join("\n")}

[위험 요소]
${judgement.risks.map((item) => `- ${item}`).join("\n")}

[사업 타이밍]
${judgement.timing}

[추천 전략]
${judgement.recommendedStrategies.map((item) => `- ${item}`).join("\n")}

[피해야 할 행동]
${judgement.avoidActions.map((item) => `- ${item}`).join("\n")}`,
  ];
}