import type { BasicSajuResult } from "../../types/basic";
export type ConsultingDecisionLevel =
  | "veryGood"
  | "good"
  | "caution"
  | "hold";
export type ConsultingRiskLevel =
  | "safe"
  | "watch"
  | "danger";
export type ConsultingDecision = {
  score: number;
  level: ConsultingDecisionLevel;
  riskLevel: ConsultingRiskLevel;
  riskLabel: string;
  riskReason: string;
  timing: string;
  grade: string;
  judgment: string;
  verdict: string;
  headline: string;
  reasons: string[];
};
function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}
function getBaseScore(data: BasicSajuResult) {
  let score = 60;
  const dayMaster = String(data.dayMaster ?? "");
  const strength = String((data as unknown as Record<string, unknown>).strength ?? "");
  if (strength.includes("신강")) score += 8;
  if (strength.includes("신약")) score -= 3;
  if (dayMaster.includes("갑") || dayMaster.includes("병") || dayMaster.includes("무")) {
    score += 5;
  }
  if (dayMaster.includes("계") || dayMaster.includes("신")) {
    score += 2;
  }
  return clampScore(score);
}
function getLifeStageBonus(stage: string) {
  switch (stage) {
    case "기반구축기":
      return 3;
    case "도약기":
      return 8;
    case "확장기":
      return 6;
    case "전환기":
      return -2;
    case "안정정리기":
      return -5;
    default:
      return 0;
  }
}
function getTopicBonus(topic: string) {
  const value = topic.toLowerCase();
  if (value.includes("이직")) return 5;
  if (value.includes("직업")) return 4;
  if (value.includes("사업")) return 2;
  if (value.includes("부동산")) return -2;
  if (value.includes("결혼")) return 3;
  if (value.includes("연애")) return 3;
  if (value.includes("건강")) return -3;
  if (value.includes("투자")) return -1;
  if (value.includes("재테크")) return -1;
  return 0;
}
function getLevel(score: number): ConsultingDecisionLevel {
  if (score >= 80) return "veryGood";
  if (score >= 65) return "good";
  if (score >= 50) return "caution";
  return "hold";
}
function getRiskLevel(score: number, topic: string): ConsultingRiskLevel {
  const value = topic.toLowerCase();
  if (
    score < 55 ||
    value.includes("건강") ||
    value.includes("투자") ||
    value.includes("부동산")
  ) {
    return score >= 70 ? "watch" : "danger";
  }
  if (score < 70 || value.includes("사업")) {
    return "watch";
  }
  return "safe";
}
function getRiskLabel(riskLevel: ConsultingRiskLevel) {
  if (riskLevel === "safe") return "안전";
  if (riskLevel === "watch") return "주의";
  return "위험";
}
function getRiskReason(riskLevel: ConsultingRiskLevel, topic: string) {
  if (riskLevel === "safe") {
    return `${topic}은 현재 흐름에서 무리한 확장만 피하면 비교적 안정적으로 검토할 수 있습니다.`;
  }
  if (riskLevel === "watch") {
    return `${topic}은 가능성은 있으나 자금, 일정, 사람, 건강 중 하나라도 불안하면 속도를 늦춰야 합니다.`;
  }
  return `${topic}은 지금 무리하게 밀어붙이면 손실이나 피로가 커질 수 있으므로 실행보다 점검이 우선입니다.`;
}
function getJudgment(level: ConsultingDecisionLevel) {
  if (level === "veryGood") return "적극 추진";
  if (level === "good") return "준비 후 추진";
  if (level === "caution") return "속도 조절";
  return "보류 및 준비";
}
function getVerdict(level: ConsultingDecisionLevel) {
  if (level === "veryGood") return "적극적으로 추진해도 좋은 흐름입니다.";
  if (level === "good") return "준비를 갖춘 뒤 추진하면 좋은 흐름입니다.";
  if (level === "caution") return "가능성은 있으나 속도 조절이 필요한 흐름입니다.";
  return "지금은 무리하게 밀어붙이기보다 준비가 우선인 흐름입니다.";
}
function getTiming(score: number, riskLevel: ConsultingRiskLevel) {
  if (riskLevel === "danger") {
    return "지금은 바로 실행하기보다 손실 가능성, 건강 부담, 자금 계획을 먼저 점검해야 합니다.";
  }
  if (score >= 85) {
    return "지금 적극적으로 추진해도 좋은 시기입니다.";
  }
  if (score >= 70) {
    return "충분히 준비한 뒤 실행하면 좋은 결과를 기대할 수 있습니다.";
  }
  if (score >= 55) {
    return "서두르기보다 3~6개월 정도 준비하며 기회를 살피는 것이 좋습니다.";
  }
  return "지금은 실행보다 준비와 점검에 집중하는 것이 유리합니다.";
}
export function buildConsultingDecision(
  data: BasicSajuResult,
  topic: string
): ConsultingDecision {
  const name = data.name;
  const dayMaster = String(data.dayMaster ?? "");
  const yearGanZhi = String(data.yearGanZhi ?? "");
  const monthGanZhi = String(data.monthGanZhi ?? "");
  const dayGanZhi = String(data.dayGanZhi ?? "");
  const birthYear = Number(
    String((data as unknown as { birthDate?: string }).birthDate ?? "").slice(0, 4)
  );
  const currentAge =
    birthYear > 1900 ? new Date().getFullYear() - birthYear + 1 : 0;
  const stage =
    currentAge <= 29
      ? "기반구축기"
      : currentAge <= 39
      ? "도약기"
      : currentAge <= 49
      ? "확장기"
      : currentAge <= 59
      ? "전환기"
      : "안정정리기";
  const score = clampScore(
    getBaseScore(data) +
      getLifeStageBonus(stage) +
      getTopicBonus(topic)
  );
  const level = getLevel(score);
  const riskLevel = getRiskLevel(score, topic);
  const riskLabel = getRiskLabel(riskLevel);
  const riskReason = getRiskReason(riskLevel, topic);
  const grade = getJudgment(level);
  const verdict = getVerdict(level);
  const timing = getTiming(score, riskLevel);
  return {
    score,
    level,
    riskLevel,
    riskLabel,
    riskReason,
    timing,
    grade,
    judgment: grade,
    verdict,
    headline: `${name}님의 ${topic} 상담은 ${verdict}
위험도 : ${riskLabel}
실행 시기 : ${timing}`,
    reasons: [
      `${name}님은 ${dayMaster} 일간의 기질을 바탕으로 판단해야 합니다.`,
      `${yearGanZhi}${monthGanZhi}${dayGanZhi} 흐름을 보면 단순한 선택보다 시기와 감당 범위가 중요합니다.`,
      `${topic}은 결과만 보는 것이 아니라 현재의 준비 상태, 실행력, 지속 가능성을 함께 봐야 합니다.`,
      riskReason,
    ],
  };
}
