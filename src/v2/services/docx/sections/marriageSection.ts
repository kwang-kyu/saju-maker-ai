import type { BasicSajuResult } from "../../../types/basic";
import { analyzeMarriage } from "../../judgement/marriageJudgement";

export function buildMarriageSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const judgement = analyzeMarriage(basic);

  return [
    `[결혼 심층 상담]

${name}님의 결혼운은 배우자를 언제 만나는가보다 어떤 가정을 만들어 갈 수 있는가를 중심으로 보는 것이 더 중요합니다.

[현재 결혼 흐름]
${judgement.currentSituation}

[결혼 강점]
${judgement.strengths.map((item) => `- ${item}`).join("\n")}

[보완해야 할 부부관계 포인트]
${judgement.weaknesses.map((item) => `- ${item}`).join("\n")}

[주의해야 할 흐름]
${judgement.risks.map((item) => `- ${item}`).join("\n")}

[결혼 타이밍]
${judgement.timing}

[추천 전략]
${judgement.recommendedStrategies.map((item) => `- ${item}`).join("\n")}

[피해야 할 행동]
${judgement.avoidActions.map((item) => `- ${item}`).join("\n")}`,
  ];
}