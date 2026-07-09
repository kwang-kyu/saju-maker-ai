import type { LoveJudgement } from "../judgement/loveJudgement";

export function formatLoveConsulting(result: LoveJudgement): string[] {
  const messages: string[] = [];

  messages.push(result.currentSituation);

  messages.push(`연애 성향은 ${result.loveType}입니다.`);
  messages.push(`표현 방식은 ${result.expressionStyle}입니다.`);
  messages.push(`관계 안정성은 ${result.stabilityLevel}입니다.`);
  messages.push(`갈등이 생기기 쉬운 지점은 ${result.conflictPoint}입니다.`);
  messages.push(`잘 맞는 상대는 ${result.matchingPartner}입니다.`);

  if (result.strengths.length > 0) {
    messages.push(`연애운의 강점은 ${result.strengths.join(", ")}`);
  }

  if (result.weaknesses.length > 0) {
    messages.push(`주의할 부분은 ${result.weaknesses.join(", ")}`);
  }

  if (result.recommendedStrategies.length > 0) {
    messages.push(`추천 전략은 ${result.recommendedStrategies.join(", ")}`);
  }

  if (result.risks.length > 0) {
    messages.push(`위험 요소는 ${result.risks.join(", ")}`);
  }

  if (result.avoidActions.length > 0) {
    messages.push(`피해야 할 행동은 ${result.avoidActions.join(", ")}`);
  }

  messages.push(result.timing);

  return messages;
}