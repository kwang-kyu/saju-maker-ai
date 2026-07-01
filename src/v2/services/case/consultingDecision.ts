import type { BasicSajuResult } from "../../types/basic";
export type ConsultingDecisionLevel =
  | "veryGood"
  | "good"
  | "caution"
  | "hold";
export type ConsultingDecision = {
  score: number;
  level: ConsultingDecisionLevel;
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
  const grade = getJudgment(level);
  const verdict = getVerdict(level);
  return {
    score,
    level,
    grade,
    judgment: grade,
    verdict,
    headline: `${name}님의 ${topic} 상담은 ${verdict}`,
    reasons: [
      `${name}님은 ${dayMaster} 일간의 기질을 바탕으로 판단해야 합니다.`,
      `${yearGanZhi}${monthGanZhi}${dayGanZhi} 흐름을 보면 단순한 선택보다 시기와 감당 범위가 중요합니다.`,
      `${topic}은 결과만 보는 것이 아니라 현재의 준비 상태, 실행력, 지속 가능성을 함께 봐야 합니다.`,
    ],
  };
}
