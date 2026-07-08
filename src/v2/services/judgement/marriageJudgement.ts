import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type MarriageJudgement = {
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

export function analyzeMarriage(basic: BasicSajuResult): MarriageJudgement {
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
    strengths.push("결혼 안에서 함께 성장하고 미래를 만들어가려는 힘이 있습니다.");
    recommendedStrategies.push("배우자와 생활 목표, 자녀 계획, 장기 방향을 함께 맞추는 관계가 좋습니다.");
  }

  if (strongElement === "화") {
    strengths.push("정서 표현과 따뜻한 분위기를 만드는 힘이 좋습니다.");
    recommendedStrategies.push("감정을 쌓아두지 말고 말과 행동으로 자주 표현하는 것이 결혼생활에 도움이 됩니다.");
  }

  if (strongElement === "토") {
    strengths.push("가정의 안정감과 책임감을 지키는 힘이 있습니다.");
    recommendedStrategies.push("생활 리듬, 재정 관리, 가족 역할을 안정적으로 나누는 결혼이 좋습니다.");
  }

  if (strongElement === "금") {
    strengths.push("기준과 책임이 분명해 결혼생활의 질서를 잡는 힘이 있습니다.");
    recommendedStrategies.push("옳고 그름만 앞세우기보다 배우자의 감정을 함께 살피는 것이 중요합니다.");
  }

  if (strongElement === "수") {
    strengths.push("배우자의 마음과 상황을 이해하려는 감각이 좋습니다.");
    recommendedStrategies.push("생각이 많아 결정을 미루기보다 중요한 문제는 기준을 정해 함께 결정하는 것이 좋습니다.");
  }

  if (weakElement === "목") {
    weaknesses.push("부부가 함께 세워갈 방향이나 장기 계획이 약해질 수 있습니다.");
    risks.push("현재 감정은 있어도 미래 설계가 부족하면 관계가 흐릿해질 수 있습니다.");
  }

  if (weakElement === "화") {
    weaknesses.push("애정 표현과 정서적 온도가 부족하게 느껴질 수 있습니다.");
    risks.push("마음은 있어도 표현이 적어 배우자가 외로움을 느낄 수 있습니다.");
  }

  if (weakElement === "토") {
    weaknesses.push("생활 안정감, 책임 분담, 가정의 기반을 꾸준히 지키는 부분이 약해질 수 있습니다.");
    risks.push("감정은 좋지만 현실적인 생활 균형이 흔들릴 수 있습니다.");
  }

  if (weakElement === "금") {
    weaknesses.push("관계의 기준과 경계가 흐려질 수 있습니다.");
    risks.push("갈등이 생겼을 때 원칙 없이 참고 넘기다가 나중에 크게 터질 수 있습니다.");
  }

  if (weakElement === "수") {
    weaknesses.push("서로의 속마음을 차분히 이해하고 조율하는 부분이 약해질 수 있습니다.");
    risks.push("불안하거나 서운한 마음을 혼자 키우면 오해가 커질 수 있습니다.");
  }

  if (weakElement === yongsin) {
    recommendedStrategies.push(`부족한 ${yongsin} 기운을 보완하는 방식으로 결혼생활의 균형을 잡는 것이 좋습니다.`);
  }

  if (strongElement === gisin) {
    avoidActions.push(`이미 강한 ${gisin} 기운이 과해지지 않도록 배우자에게 일방적으로 요구하거나 밀어붙이는 방식은 피하는 것이 좋습니다.`);
  }

  const currentSituation = `${dayMaster} 일간의 결혼운은 배우자를 언제 만나느냐보다 어떤 생활 구조와 관계 방식을 만들 수 있느냐가 중요합니다. 강한 ${strongElement} 기운은 결혼생활에서 드러나는 장점이고, 약한 ${weakElement} 기운은 부부관계에서 보완해야 할 부분입니다.`;

  const timing = "지금은 결혼을 급하게 결론 내리기보다 생활 방식, 금전 감각, 가족관, 갈등 해결 방식을 차분히 확인하는 것이 중요합니다.";

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