export type ConsultingRiskLevel =
  | "safe"
  | "watch"
  | "danger";
export type ConsultingDecision = {
  score: number;
  grade: string;
  verdict: string;
  headline: string;
  reasons: string[];
  riskLevel?: ConsultingRiskLevel;
  riskLabel?: string;
  riskReason?: string;
  timing?: string;
  actionCondition?: string;
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
function getRiskGuide(decision: ConsultingDecision) {
  if (!decision.riskLabel && !decision.riskReason) {
    return "";
  }
  return `
[위험도 판단]
위험도: ${decision.riskLabel ?? "주의"}
${decision.riskReason ?? "현재 사안은 가능성과 부담을 함께 보고 신중하게 판단해야 합니다."}`;
}
function getTimingGuide(decision: ConsultingDecision) {
  if (!decision.timing) {
    return "";
  }
  return `
[실행 시기 판단]
${decision.timing}`;
}
function getActionConditionGuide(decision: ConsultingDecision) {
  if (!decision.actionCondition) {
    return "";
  }
  return `
[실행 조건]
${decision.actionCondition}`;
}
function getReasonLines(reasons: string[]) {
  return reasons
    .filter((reason) => reason && reason.trim())
    .slice(0, 5)
    .map((reason, index) => `${index + 1}. ${reason}`)
    .join("\n");
}
export function buildConsultingReport(input: ConsultingReportInput) {
  const futureText =
    input.future && input.future.trim()
      ? `
[앞으로 3년 방향]
${input.future}`
      : "";
  const riskGuide = getRiskGuide(input.decision);
  const timingGuide = getTimingGuide(input.decision);
  const actionConditionGuide = getActionConditionGuide(input.decision);
  const reasonLines = getReasonLines(input.decision.reasons);
  return `[${input.title}]
━━━━━━━━━━━━━━━━━━━━━━
[AI 원장 1차 판단]
${input.decision.grade}
추천도 ${input.decision.score}점
판정: ${input.decision.verdict}${riskGuide}${timingGuide}${actionConditionGuide}
결론부터 말씀드리겠습니다.
${input.decision.headline}
[판단 근거]
${reasonLines}
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
