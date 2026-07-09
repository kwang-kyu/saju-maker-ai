import type { MoneyJudgement } from "../judgement/moneyJudgement";

export function formatMoneyConsulting(result: MoneyJudgement): string[] {
  const messages: string[] = [];

  messages.push(result.currentSituation);

  messages.push(`재물 성향은 ${result.moneyType}입니다.`);
  messages.push(`주요 수입 방향은 ${result.incomeSource}입니다.`);
  messages.push(`돈이 새기 쉬운 지점은 ${result.leakPoint}입니다.`);
  messages.push(result.investmentDecision);

  if (result.strengths.length > 0) {
    messages.push(`재물운의 강점은 ${result.strengths.join(", ")}`);
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