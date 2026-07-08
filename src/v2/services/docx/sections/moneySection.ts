import type { BasicSajuResult } from "../../../types/basic";
import { analyzeMoney } from "../../judgement/moneyJudgement";

export function buildMoneySection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const judgement = analyzeMoney(basic);

  return [
    `[재물 심층 상담]

${name}님의 재물운은 단순히 돈이 많이 들어오는지보다 어떤 방식으로 돈을 만들고 지켜야 하는지를 함께 살펴보는 것이 중요합니다.

[현재 재물 흐름]
${judgement.currentSituation}

[재물 강점]
${judgement.strengths.map((item) => `- ${item}`).join("\n")}

[보완해야 할 약점]
${judgement.weaknesses.map((item) => `- ${item}`).join("\n")}

[위험 요소]
${judgement.risks.map((item) => `- ${item}`).join("\n")}

[재물 타이밍]
${judgement.timing}

[추천 전략]
${judgement.recommendedStrategies.map((item) => `- ${item}`).join("\n")}

[피해야 할 행동]
${judgement.avoidActions.map((item) => `- ${item}`).join("\n")}`,
  ];
}