import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";
export type BusinessJudgement = {
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

export function analyzeBusiness(basic: BasicSajuResult): BusinessJudgement {
    const profile = buildSajuProfile(basic);

    const strongElement = profile.strongestElement;
    const weakElement = profile.weakestElement;
    const dayMaster = profile.dayMaster;
    
    const expansion = profile.expansionScore;
    const stability = profile.stabilityScore;
    // const investment = profile.investmentScore;
    const partnership = profile.partnershipScore;
    // const leadership = profile.leadershipScore;
    const cashFlow = profile.cashFlowScore;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  if (strongElement === "목") {
    strengths.push("새로운 시장을 개척하고 방향을 밀고 나가는 힘이 있습니다.");
    recommendedStrategies.push("초기 기획, 브랜드 확장, 신규 고객 확보에 강점을 두십시오.");
  }

  if (strongElement === "화") {
    strengths.push("홍보, 표현, 설득, 사람을 끌어들이는 힘이 있습니다.");
    recommendedStrategies.push("마케팅, 콘텐츠, 영업 채널을 적극적으로 활용하십시오.");
  }

  if (strongElement === "토") {
    strengths.push("조직을 안정적으로 관리하고 신뢰를 쌓는 힘이 있습니다.");
    recommendedStrategies.push("무리한 확장보다 기존 고객 관리와 운영 안정성을 우선하십시오.");
  }

  if (strongElement === "금") {
    strengths.push("판단, 기준, 정리, 숫자 관리에 강점이 있습니다.");
    recommendedStrategies.push("계약, 정산, 수익 구조, 비용 통제를 먼저 정비하십시오.");
  }

  if (strongElement === "수") {
    strengths.push("정보 수집, 흐름 파악, 유연한 대응에 강점이 있습니다.");
    recommendedStrategies.push("시장 조사, 데이터 분석, 온라인 유입 구조를 강화하십시오.");
  }

  if (weakElement === "목") {
    weaknesses.push("새로운 방향을 시작하거나 꾸준히 키우는 힘이 약해질 수 있습니다.");
    risks.push("아이디어는 있어도 실행이 늦어지거나 중간에 방향이 흔들릴 수 있습니다.");
    avoidActions.push("계획 없이 여러 사업을 동시에 시작하는 행동은 피하십시오.");
  }

  if (weakElement === "화") {
    weaknesses.push("홍보, 노출, 설득력이 약해질 수 있습니다.");
    risks.push("좋은 상품이나 서비스가 있어도 고객에게 충분히 알려지지 않을 수 있습니다.");
    recommendedStrategies.push("마케팅과 소개 구조를 별도로 설계하십시오.");
  }

  if (weakElement === "토") {
    weaknesses.push("운영 관리와 지속성이 약해질 수 있습니다.");
    risks.push("처음에는 잘 되더라도 관리 체계가 약하면 금방 흔들릴 수 있습니다.");
    avoidActions.push("관리자 없이 감으로만 운영하는 방식은 피하십시오.");
  }

  if (weakElement === "금") {
    weaknesses.push("계약, 숫자, 손익 계산에서 허점이 생길 수 있습니다.");
    risks.push("매출은 있어도 실제 이익이 남지 않는 구조가 될 수 있습니다.");
    recommendedStrategies.push("계약서, 원가, 마진, 세금 구조를 먼저 점검하십시오.");
  }

  if (weakElement === "수") {
    weaknesses.push("정보 판단과 현금 흐름 관리가 약해질 수 있습니다.");
    risks.push("시장 변화를 늦게 알아차리거나 자금 회전이 막힐 수 있습니다.");
    avoidActions.push("충분한 현금 없이 크게 벌이는 투자는 피하십시오.");
  }

  const isExpansion = expansion >= 70;
  const isStable = stability >= 70;
  const isCashWeak = cashFlow <= 40;
  const isPartnershipWeak = partnership <= 40;

  const currentSituation = isExpansion
  ? `${dayMaster}의 기운을 바탕으로 사업을 확장하거나 새로운 기회를 추진하기 좋은 흐름입니다.`
  : `${dayMaster}의 기운은 안정적인 운영과 기반을 다지는 방향에서 더 좋은 결과를 기대할 수 있습니다.`;

const timing = isExpansion
  ? "지금은 사업 기회를 시험해 보고 점진적으로 확장하기에 적합한 시기입니다."
  : "지금은 사업 규모를 키우기보다 내실을 다지고 준비하는 것이 유리한 시기입니다.";

  

    if (isExpansion) {
        recommendedStrategies.push("지금은 사업 확장을 검토할 수 있는 흐름입니다.");
      }
      
      if (isStable) {
        recommendedStrategies.push("급격한 변화보다 안정적인 운영을 유지하는 것이 유리합니다.");
      }
      
      if (isCashWeak) {
        recommendedStrategies.push("현금 확보를 최우선으로 하는 전략이 필요합니다.");
      }
      
      if (isPartnershipWeak) {
        avoidActions.push("동업이나 공동투자는 신중하게 판단하는 것이 좋습니다.");
      }

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