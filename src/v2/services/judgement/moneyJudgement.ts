import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type MoneyJudgement = {
  suitability: string;
  moneyType: string;
  incomeSource: string;
  leakPoint: string;
  investmentDecision: string;
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

export function analyzeMoney(basic: BasicSajuResult): MoneyJudgement {
  const profile = buildSajuProfile(basic);

  const tenGods = [
    profile.yearTenGod,
    profile.monthTenGod,
    profile.timeTenGod,
  ];

  const hasStableWealth = hasTenGod(tenGods, ["정재"]);
  const hasVariableWealth = hasTenGod(tenGods, ["편재"]);
  const hasOutput = hasTenGod(tenGods, ["식신", "상관"]);
  const hasCompanion = hasTenGod(tenGods, ["비견", "겁재"]);
  const hasOfficer = hasTenGod(tenGods, ["정관", "편관"]);
  const hasResource = hasTenGod(tenGods, ["정인", "편인"]);

  const isCashWeak = profile.cashFlowScore <= 40 || profile.weakestElement === "수";
  const isInvestmentStrong =
    profile.investmentScore >= 70 || hasVariableWealth || profile.strongestElement === "금";
  const isAccumulationStrong =
    profile.stabilityScore >= 70 || hasStableWealth || profile.strongestElement === "토";
  const isLeakRisk = hasCompanion || profile.gisin === profile.strongestElement;

  const suitability =
    profile.moneyScore >= 70
      ? "높음"
      : profile.moneyScore >= 50
      ? "보통"
      : "낮음";

  const moneyType = isCashWeak
    ? "현금흐름관리형"
    : isInvestmentStrong
    ? "투자판단형"
    : isAccumulationStrong
    ? "자산축적형"
    : hasOutput
    ? "수익창출형"
    : "안정관리형";

  const incomeSource = hasStableWealth
    ? "고정 수입, 반복 거래, 안정적인 계약"
    : hasVariableWealth
    ? "영업, 유통, 투자, 외부 기회"
    : hasOutput
    ? "기획, 콘텐츠, 상품화, 기술 제공"
    : hasResource
    ? "전문성, 상담, 교육, 문서 기반 수입"
    : "반복 수입과 안정적인 일 구조";

  const leakPoint = isCashWeak
    ? "현금 회전과 비상자금 부족"
    : hasCompanion
    ? "사람 관계, 동업, 경쟁 지출"
    : profile.weakestElement === "금"
    ? "계약, 숫자, 마진 계산"
    : "계획 없는 확장 지출";

  const investmentDecision =
    suitability === "높음" && isInvestmentStrong && !isCashWeak
      ? "투자는 가능하지만 기준가, 손절 기준, 회수 기간을 정한 뒤 진행해야 합니다."
      : isCashWeak
      ? "지금은 공격적 투자보다 현금 확보와 부채 관리가 우선입니다."
      : "투자는 소액 검증과 분산 관리 중심으로 접근해야 합니다.";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  if (hasStableWealth) {
    strengths.push("정재 구조가 있어 안정적인 수입과 반복 거래를 만드는 데 강점이 있습니다.");
    recommendedStrategies.push("고정 수입, 월 단위 계약, 반복 매출 구조를 먼저 만드십시오.");
  }

  if (hasVariableWealth) {
    strengths.push("편재 구조가 있어 외부 기회, 영업, 투자 감각을 활용할 수 있습니다.");
    recommendedStrategies.push("기회를 잡되 투자금, 회수 기간, 손실 한도를 먼저 정하십시오.");
  }

  if (hasOutput) {
    strengths.push("식상 구조가 있어 아이디어를 상품화하고 수익으로 바꾸는 힘이 있습니다.");
    recommendedStrategies.push("생각을 상품, 콘텐츠, 서비스로 바꾸는 구조를 만드십시오.");
  }

  if (hasOfficer) {
    strengths.push("관성 구조가 있어 직장, 조직, 계약 기반의 안정 수입에 강점이 있습니다.");
    recommendedStrategies.push("규칙적인 수입과 신뢰 기반 계약을 재물 기반으로 삼으십시오.");
  }

  if (hasResource) {
    strengths.push("인성 구조가 있어 지식, 자격, 경험을 돈으로 바꾸는 구조에 강점이 있습니다.");
    recommendedStrategies.push("전문성, 문서화, 상담형 상품을 수입 구조로 연결하십시오.");
  }

  if (isCashWeak) {
    weaknesses.push("현금흐름이 약하면 수입이 있어도 돈이 오래 머물기 어렵습니다.");
    risks.push("비상자금 없이 투자나 사업비가 커지면 자금 압박이 빨리 올 수 있습니다.");
    recommendedStrategies.push("생활비, 고정비, 사업비를 분리하고 최소 3개월 비상자금을 확보하십시오.");
    avoidActions.push("현금 여유 없이 대출, 투자, 확장을 동시에 진행하지 마십시오.");
  }

  if (isLeakRisk) {
    weaknesses.push("돈이 사람 관계나 경쟁 구조 속에서 새어나갈 가능성이 있습니다.");
    risks.push("동업, 지인 거래, 감정적 지출이 반복되면 실제 자산 축적이 늦어질 수 있습니다.");
    avoidActions.push("친분만으로 돈을 빌려주거나 지분, 수익 배분을 정하지 마십시오.");
  }

  if (profile.weakestElement === "금") {
    weaknesses.push("숫자, 계약, 마진 관리가 약하면 벌어도 남는 돈이 줄어들 수 있습니다.");
    recommendedStrategies.push("원가, 세금, 수수료, 순이익을 표로 관리하십시오.");
  }

  const currentSituation = `${profile.dayMaster} 일간 기준으로 보면 이 사주의 재물 구조는 '${moneyType}'입니다. 돈이 들어오는 방식은 ${incomeSource} 쪽이며, 가장 조심할 지점은 ${leakPoint}입니다.`;

  const timing =
    suitability === "높음"
      ? "지금은 돈의 기회를 검토해도 되는 흐름입니다. 다만 수입보다 먼저 현금흐름과 손실 한도를 정해야 합니다."
      : suitability === "보통"
      ? "지금은 자산을 크게 불리기보다 수입 구조와 지출 구조를 정리하는 시기입니다."
      : "지금은 공격적인 투자보다 지출 통제, 부채 관리, 현금 확보가 우선인 시기입니다.";

  return {
    suitability,
    moneyType,
    incomeSource,
    leakPoint,
    investmentDecision,
    currentSituation,
    strengths,
    weaknesses,
    risks,
    timing,
    recommendedStrategies,
    avoidActions,
  };
}