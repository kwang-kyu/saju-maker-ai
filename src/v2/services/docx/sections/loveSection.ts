import type { BasicSajuResult } from "../../../types/basic";
import { analyzeLove } from "../../judgement/loveJudgement";


export function buildLoveSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const judgement = analyzeLove(basic);
  
  return [
    `[연애 심층 상담]

${name}님의 연애운은 단순히 인연이 많고 적음보다 어떤 사람과 관계를 이어갈 때 안정감을 느끼는지가 더 중요합니다.

[현재 연애 흐름]
${judgement.currentSituation}

[연애 강점]
${judgement.strengths.map((item) => `- ${item}`).join("\n")}

[보완해야 할 관계 포인트]
${judgement.weaknesses.map((item) => `- ${item}`).join("\n")}

[주의해야 할 흐름]
${judgement.risks.map((item) => `- ${item}`).join("\n")}

[연애 타이밍]
${judgement.timing}

[추천 전략]
${judgement.recommendedStrategies.map((item) => `- ${item}`).join("\n")}

[피해야 할 행동]
${judgement.avoidActions.map((item) => `- ${item}`).join("\n")}`,
  ];
}