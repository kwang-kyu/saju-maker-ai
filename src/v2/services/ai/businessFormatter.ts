import type { BusinessJudgement } from "../judgement/businessJudgement";

function joinSentences(sentences: string[]): string {
  return sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join(" ");
}

export function formatBusinessConsulting(
  result: BusinessJudgement
): string[] {
  const messages: string[] = [];

  messages.push(result.currentSituation);

  if (result.strengths.length > 0) {
    messages.push(
      `사업에서 살아나는 강점은 다음과 같습니다. ${joinSentences(
        result.strengths
      )}`
    );
  }

  if (result.weaknesses.length > 0) {
    messages.push(
      `주의해야 할 부분은 다음과 같습니다. ${joinSentences(
        result.weaknesses
      )}`
    );
  }

  if (result.recommendedStrategies.length > 0) {
    messages.push(
      `현재 가장 좋은 방향은 다음과 같습니다. ${joinSentences(
        result.recommendedStrategies
      )}`
    );
  }

  if (result.risks.length > 0) {
    messages.push(
      `현실적으로 조심해야 할 위험은 다음과 같습니다. ${joinSentences(
        result.risks
      )}`
    );
  }

  if (result.avoidActions.length > 0) {
    messages.push(
      `피해야 할 행동은 다음과 같습니다. ${joinSentences(
        result.avoidActions
      )}`
    );
  }

  messages.push(result.timing);

  return messages;
}