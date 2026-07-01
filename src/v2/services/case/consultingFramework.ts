export type ConsultingDecision = {
  score: number;
  grade: string;
  verdict: string;
  headline: string;
  reasons: string[];
};
export type ConsultingReportInput = {
  title: string;
  question: string;
  decision: ConsultingDecision;
  opening: string;
  sajuAnalysis: string;
  reality: string;
  caution: string;
  strategy: string;
  future?: string;
  closing: string;
};
export function buildConsultingReport(input: ConsultingReportInput) {
  const futureText =
    input.future && input.future.trim()
      ? `
[앞으로 3년 방향]
${input.future}`
      : "";
  return `[${input.title}]
━━━━━━━━━━━━━━━━━━━━━━
[AI 원장 1차 판단]
${input.decision.grade}
추천도 ${input.decision.score}점
판정: ${input.decision.verdict}
결론부터 말씀드리겠습니다.
${input.decision.headline}
[판단 근거]
1. ${input.decision.reasons[0]}
2. ${input.decision.reasons[1]}
3. ${input.decision.reasons[2]}
━━━━━━━━━━━━━━━━━━━━━━
[상담 질문]
${input.question}
[원장님의 첫 진단]
${input.opening}
[사주 근거 분석]
${input.sajuAnalysis}
[현실 판단]
${input.reality}
[지금 가장 조심할 점]
${input.caution}
[실천 전략]
${input.strategy}${futureText}
[AI 원장 최종 총평]
${input.closing}`;
}

