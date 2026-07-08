import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type LoveJudgement = {
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

export function analyzeLove(basic: BasicSajuResult): LoveJudgement {
  const profile = buildSajuProfile(basic);

  const dayMaster = profile.dayMaster;
  const strongElement = profile.strongestElement;
  const weakElement = profile.weakestElement;
  const yongsin = profile.yongsin;
  const gisin = profile.gisin;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  if (strongElement === "목") {
    strengths.push("관계 안에서 함께 성장하려는 힘이 강합니다.");
    recommendedStrategies.push("상대와 미래 방향, 생활 목표, 성장 계획을 함께 맞춰가는 관계가 좋습니다.");
  }

  if (strongElement === "화") {
    strengths.push("표현력과 매력이 살아나기 쉬운 연애 흐름입니다.");
    recommendedStrategies.push("감정을 숨기기보다 따뜻하게 표현하는 방식이 관계에 도움이 됩니다.");
  }

  if (strongElement === "토") {
    strengths.push("안정감과 책임감으로 관계를 오래 유지하는 힘이 있습니다.");
    recommendedStrategies.push("급한 감정보다 신뢰와 생활 리듬을 맞추는 관계가 좋습니다.");
  }

  if (strongElement === "금") {
    strengths.push("기준이 분명하고 쉽게 흔들리지 않는 연애 성향이 있습니다.");
    recommendedStrategies.push("상대에게 차갑게 보이지 않도록 감정 표현을 조금 더 열어두는 것이 좋습니다.");
  }

  if (strongElement === "수") {
    strengths.push("상대의 마음을 읽고 분위기를 이해하는 감각이 좋습니다.");
    recommendedStrategies.push("불안한 감정을 혼자 쌓아두지 말고 대화로 풀어가는 것이 중요합니다.");
  }

  if (weakElement === "목") {
    weaknesses.push("관계의 방향을 정하거나 미래를 함께 설계하는 힘이 약해질 수 있습니다.");
    risks.push("좋아하는 마음은 있어도 관계가 흐릿하게 이어질 수 있습니다.");
  }

  if (weakElement === "화") {
    weaknesses.push("마음은 있어도 표현이 부족해 상대가 확신을 느끼기 어려울 수 있습니다.");
    risks.push("감정 표현이 늦어져 관계의 온도가 식을 수 있습니다.");
  }

  if (weakElement === "토") {
    weaknesses.push("관계의 안정감과 책임 있는 선택이 흔들릴 수 있습니다.");
    risks.push("감정은 앞서지만 현실적인 약속과 생활 균형이 약해질 수 있습니다.");
  }

  if (weakElement === "금") {
    weaknesses.push("관계의 기준이 흐려지거나 끊어야 할 관계를 오래 끌 수 있습니다.");
    risks.push("상대에게 맞추다 자신의 기준을 잃을 수 있습니다.");
  }

  if (weakElement === "수") {
    weaknesses.push("상대의 속마음이나 관계의 흐름을 지나치게 불안하게 받아들일 수 있습니다.");
    risks.push("확인받고 싶은 마음이 커져 관계가 무거워질 수 있습니다.");
  }

  if (weakElement === yongsin) {
    recommendedStrategies.push(`부족한 ${yongsin} 기운을 보완하는 방식으로 관계의 균형을 잡는 것이 좋습니다.`);
  }

  if (strongElement === gisin) {
    avoidActions.push(`이미 강한 ${gisin} 기운이 과해지지 않도록 감정적 판단이나 일방적인 요구는 피하는 것이 좋습니다.`);
  }

  const currentSituation = `${dayMaster} 일간의 연애 흐름은 단순히 인연이 많고 적음보다 어떤 방식으로 마음을 주고받는지가 중요합니다. 강한 ${strongElement} 기운은 관계에서 드러나는 장점이고, 약한 ${weakElement} 기운은 보완해야 할 부분입니다.`;

  const timing = "지금은 관계를 급하게 결론 내리기보다 상대와의 속도, 신뢰, 감정 표현 방식을 조정하는 것이 중요합니다.";

  return {
    currentSituation,
    strengths,
    weaknesses,
    risks,
    timing,
    recommendedStrategies,
    avoidActions,
  };
}