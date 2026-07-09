import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type BusinessJudgement = {
  suitability: string;
  businessType: string;
  decision: string;
  cautionPoint: string;
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

function hasTenGod(profileTenGods: string[], targets: string[]) {
  return profileTenGods.some((tenGod) =>
    targets.some((target) => tenGod.includes(target))
  );
}

export function analyzeBusiness(basic: BasicSajuResult): BusinessJudgement {
  const profile = buildSajuProfile(basic);

  const tenGods = [
    profile.yearTenGod,
    profile.monthTenGod,
    profile.timeTenGod,
  ];

  const hasWealth = hasTenGod(tenGods, ["정재", "편재"]);
  const hasOutput = hasTenGod(tenGods, ["식신", "상관"]);
  const hasCompanion = hasTenGod(tenGods, ["비견", "겁재"]);
  const hasOfficer = hasTenGod(tenGods, ["정관", "편관"]);
  const hasResource = hasTenGod(tenGods, ["정인", "편인"]);

  const isExpansion = profile.expansionScore >= 70 || hasOutput;
  const isStable = profile.stabilityScore >= 70 || hasOfficer;
  const isCashWeak = profile.cashFlowScore <= 40 || profile.gisin === "금";
  const isPartnershipWeak =
    profile.partnershipScore <= 40 || hasCompanion || profile.weakestElement === "화";

  const suitability =
    profile.businessScore >= 70
      ? "높음"
      : profile.businessScore >= 50
      ? "보통"
      : "낮음";

  const businessType = isCashWeak
    ? "현금흐름관리형"
    : isPartnershipWeak
    ? "단독운영형"
    : isExpansion
    ? "확장형"
    : isStable
    ? "안정운영형"
    : "관리형";

  const cautionPoint = isCashWeak
    ? "고정비와 현금흐름"
    : isPartnershipWeak
    ? "동업과 지분 관계"
    : isExpansion
    ? "무리한 확장"
    : "운영 체계 부족";

  const decision =
    suitability === "높음"
      ? `사업 적합도는 높습니다. 다만 ${businessType}으로 움직일 때 성과가 가장 안정적입니다.`
      : suitability === "보통"
      ? `사업은 가능하지만 공격적 확장보다 ${businessType} 구조를 먼저 잡아야 합니다.`
      : `지금은 사업을 크게 벌리기보다 ${businessType}으로 위험을 줄이는 것이 우선입니다.`;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  if (hasWealth) {
    strengths.push("재성 구조가 있어 매출, 거래, 수익 계산에 강점이 있습니다.");
    recommendedStrategies.push("가격, 마진, 회수 기간을 숫자로 정리한 뒤 사업을 진행하십시오.");
  }

  if (hasOutput) {
    strengths.push("식상 구조가 있어 상품화, 기획, 홍보, 콘텐츠화에 강점이 있습니다.");
    recommendedStrategies.push("아이디어를 바로 실행하기보다 상품, 고객, 판매 채널로 구체화하십시오.");
  }

  if (hasOfficer) {
    strengths.push("관성 구조가 있어 책임, 조직, 규칙, 관리형 사업에 강점이 있습니다.");
    recommendedStrategies.push("계약서, 운영 기준, 업무 분담표를 먼저 갖춘 뒤 확장하십시오.");
  }

  if (hasResource) {
    strengths.push("인성 구조가 있어 지식, 상담, 교육, 문서 기반 사업에 강점이 있습니다.");
    recommendedStrategies.push("전문성, 신뢰, 설명력을 상품의 핵심 가치로 삼으십시오.");
  }

  if (hasCompanion) {
    weaknesses.push("비겁 구조가 강하면 동업, 경쟁, 지분 문제에서 갈등이 생기기 쉽습니다.");
    risks.push("사람을 믿고 시작했지만 역할과 책임이 불분명하면 손실이 커질 수 있습니다.");
    avoidActions.push("친분만으로 동업하거나 지분을 나누는 행동은 피하십시오.");
  }

  if (isCashWeak) {
    weaknesses.push("현금흐름 관리가 약하면 매출이 있어도 실제 이익이 남지 않을 수 있습니다.");
    risks.push("고정비, 인건비, 광고비가 먼저 커지면 사업 체력이 빠르게 약해집니다.");
    recommendedStrategies.push("최소 3개월 운영비와 손익분기점을 먼저 계산하십시오.");
    avoidActions.push("현금 여유 없이 임대료, 인건비, 광고비를 동시에 늘리지 마십시오.");
  }

  if (isExpansion) {
    recommendedStrategies.push("확장은 가능합니다. 단, 검증된 상품과 고객 반응이 있을 때만 키우십시오.");
  }

  if (isStable) {
    recommendedStrategies.push("안정적인 운영 체계와 반복 매출 구조를 만들수록 사업 운이 살아납니다.");
  }

  const currentSituation = `${profile.dayMaster} 일간 기준으로 보면 이 사주는 사업을 감정으로 밀어붙이기보다 ${businessType}으로 설계해야 결과가 좋아집니다. 현재 핵심 판단은 '${decision}'입니다.`;

  const timing =
    suitability === "높음"
      ? "지금은 사업 기회를 검토해도 되는 흐름입니다. 다만 확장 전 현금흐름과 역할 구조를 먼저 확정해야 합니다."
      : suitability === "보통"
      ? "지금은 준비와 검증의 시기입니다. 작게 테스트한 뒤 반응이 확인되면 단계적으로 키우는 방식이 맞습니다."
      : "지금은 큰 창업이나 무리한 투자를 하기보다 비용을 줄이고 사업 구조를 다시 설계하는 시기입니다.";

  return {
    suitability,
    businessType,
    decision,
    cautionPoint,
    currentSituation,
    strengths,
    weaknesses,
    risks,
    timing,
    recommendedStrategies,
    avoidActions,
  };
}