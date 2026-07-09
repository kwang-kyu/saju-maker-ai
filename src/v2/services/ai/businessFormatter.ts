import type { BusinessJudgement } from "../judgement/businessJudgement";

export function formatBusinessConsulting(
  result: BusinessJudgement
): string[] {
  const messages: string[] = [];

  messages.push(result.currentSituation);

  if (result.strengths.length > 0) {
    messages.push(
      `강점은 ${result.strengths.join(", ")}입니다.`
    );
  }

  if (result.weaknesses.length > 0) {
    messages.push(
      `주의해야 할 부분은 ${result.weaknesses.join(", ")}입니다.`
    );
  }

  if (result.recommendedStrategies.length > 0) {
    messages.push(
      `현재 가장 좋은 방향은 ${result.recommendedStrategies.join(", ")}입니다.`
    );
  }

  if (result.risks.length > 0) {
    messages.push(
      `조심해야 할 요소는 ${result.risks.join(", ")}입니다.`
    );
  }

  messages.push(result.timing);

  return messages;
}