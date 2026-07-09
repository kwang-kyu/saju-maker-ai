import type { MarriageJudgement } from "../judgement/marriageJudgement";

export function formatMarriageConsulting(result: MarriageJudgement): string[] {
  const messages: string[] = [];

  messages.push(result.currentSituation);

  messages.push(`결혼 점수는 ${result.marriageScore}점입니다.`);
  messages.push(`결혼 판단은 ${result.marriageGrade}입니다.`);
  messages.push(`결혼 유형은 ${result.marriageType}입니다.`);
  messages.push(result.agePerspective);
  messages.push(`생활 안정성은 ${result.stability}`);
  messages.push(`가정관은 ${result.familyValue}`);
  messages.push(`경제관은 ${result.financialView}`);
  messages.push(`배우자와의 협력 방식은 ${result.partnership}`);
  messages.push(`갈등 원인은 ${result.conflictCause}`);
  messages.push(`장기 안정성은 ${result.longTermStability}`);
  messages.push(`잘 맞는 배우자 유형은 ${result.recommendedPartner}`);

  if (result.strengths.length > 0) {
    messages.push(`결혼운의 강점은 ${result.strengths.join(", ")}`);
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