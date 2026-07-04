import type { BasicSajuResult } from "../../types/basic";
import { buildSajuIdentityProfile } from "../profile/sajuIdentityProfile";

export type MasterDecision = {
  lifePhase: string;
  yearlyKeyword: string;
  priorityArea: string;
  decisionStyle: string;
  moneyFlow: string;
  investmentStrategy: string;
  careerStrategy: string;
  relationshipStrategy: string;
  healthFocus: string;
  actionNow: string[];
  actionNext: string[];
  warnings: string[];
  finalDirection: string;
};

export function buildMasterDecision(data: BasicSajuResult): MasterDecision {
  const identity = buildSajuIdentityProfile(data);

  const baseText = [
    identity.lifeStyle,
    identity.decisionStyle,
    identity.moneyStyle,
    identity.workStyle,
    identity.relationshipStyle,
    identity.riskPoint,
    identity.successPoint,
  ].join(" ");

  const isStrong = baseText.includes("주도") || baseText.includes("추진") || baseText.includes("확장");
  const needsBalance = baseText.includes("균형") || baseText.includes("조절") || baseText.includes("기준");
  const needsStability = baseText.includes("안정") || baseText.includes("관리") || baseText.includes("고정비");

  const decisionStyle = isStrong
    ? "주도형"
    : needsStability
      ? "안정형"
      : "균형형";

  const yearlyKeyword = needsBalance
    ? "균형"
    : isStrong
      ? "선택과 집중"
      : "기반 정리";

  const priorityArea = needsStability
    ? "재테크와 현금흐름 관리"
    : isStrong
      ? "직업사업 방향 정리"
      : "생활 리듬과 관계 안정";

  const investmentStrategy = decisionStyle === "주도형"
    ? "기회는 보되 한 번에 크게 들어가기보다 검증 후 단계적으로 움직이는 전략"
    : decisionStyle === "안정형"
      ? "현금흐름을 먼저 확보하고 장기분산 중심으로 자산을 쌓는 전략"
      : "무리한 승부보다 균형 잡힌 자산배분으로 안정성과 성장성을 함께 보는 전략";

  return {
    lifePhase: needsBalance ? "조정기" : isStrong ? "방향 전환기" : "기반 형성기",
    yearlyKeyword,
    priorityArea,
    decisionStyle,
    moneyFlow: needsStability ? "축적형" : isStrong ? "변동형" : "균형형",
    investmentStrategy,
    careerStrategy: isStrong
      ? "새로운 역할이나 확장보다 본인이 주도권을 잡을 수 있는 분야를 선별하는 전략"
      : "지금 가진 역량을 정리하고 신뢰를 쌓아 다음 기회를 준비하는 전략",
    relationshipStrategy: needsBalance
      ? "관계를 넓히기보다 피로한 관계를 정리하고 핵심 인연을 남기는 전략"
      : "필요한 협력은 받아들이되 결정권은 스스로 지키는 전략",
    healthFocus: needsBalance
      ? "과로와 생활 리듬 붕괴를 막는 관리"
      : "기초 체력과 수면, 소화 리듬을 안정시키는 관리",
    actionNow: [
      "지금 당장 큰 결정을 늘리기보다 현재 돈일관계의 흐름을 정리하기",
      "현금흐름과 고정지출을 먼저 점검하기",
      "올해 가장 중요한 목표를 하나로 좁히기",
    ],
    actionNext: [
      "3개월 안에 준비할 일과 미룰 일을 구분하기",
      "1년 안에 자산직업건강 중 하나의 핵심 성과를 만들기",
      "무리한 확장보다 오래 유지할 수 있는 구조를 만들기",
    ],
    warnings: [
      "감정적으로 결정하는 투자나 계약은 피해야 합니다.",
      "한 번에 모든 문제를 해결하려는 방식은 오히려 흐름을 흐릴 수 있습니다.",
      "주변 말에 흔들려 본인의 기준 없이 움직이는 것을 조심해야 합니다.",
    ],
    finalDirection: "올해는 많이 벌리는 것보다 중요한 것을 선별하고, 오래 갈 수 있는 기반을 만드는 쪽이 유리합니다.",
  };
}
