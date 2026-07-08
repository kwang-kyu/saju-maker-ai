import type { BasicSajuResult } from "../../types/basic";
import { buildSajuProfile } from "../profile/sajuProfile";

export type MoneyJudgement = {
  currentSituation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  timing: string;
  recommendedStrategies: string[];
  avoidActions: string[];
};

export function analyzeMoney(basic: BasicSajuResult): MoneyJudgement {
    const profile = buildSajuProfile(basic);

  const strongElement = profile.strongestElement;
  const weakElement = profile.weakestElement;
  const dayMaster = profile.dayMaster;
  const summary = basic.summary ?? "";

  const yongsin = profile.yongsin;
  const gisin = profile.gisin;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];
  const recommendedStrategies: string[] = [];
  const avoidActions: string[] = [];

  switch (strongElement) {
    case "목":
      strengths.push("새로운 수익원을 찾는 감각이 뛰어난 편입니다.");
      recommendedStrategies.push("기존 수입보다 새로운 시장과 신규 사업을 함께 검토하십시오.");
      break;

    case "화":
      strengths.push("사람을 통한 수익 창출 능력이 좋은 편입니다.");
      recommendedStrategies.push("영업, 홍보, 콘텐츠를 적극 활용하는 것이 좋습니다.");
      break;

    case "토":
      strengths.push("돈을 안정적으로 관리하는 능력이 좋습니다.");
      recommendedStrategies.push("장기적인 자산 축적과 안정적인 투자 전략이 적합합니다.");
      break;

    case "금":
      strengths.push("숫자와 계약을 꼼꼼하게 관리하는 능력이 뛰어납니다.");
      recommendedStrategies.push("비용 절감과 수익률 관리에 집중하십시오.");
      break;

    case "수":
      strengths.push("시장 흐름과 자금 흐름을 읽는 능력이 좋습니다.");
      recommendedStrategies.push("투자 정보와 시장 변화를 꾸준히 분석하십시오.");
      break;
  }

  switch (weakElement) {
    case "목":
      weaknesses.push("새로운 기회를 놓칠 가능성이 있습니다.");
      risks.push("좋은 기회가 와도 실행이 늦어질 수 있습니다.");
      avoidActions.push("지나치게 보수적인 판단만 반복하지 마십시오.");
      break;

    case "화":
      weaknesses.push("수익을 만드는 활동성이 부족할 수 있습니다.");
      risks.push("좋은 상품도 충분히 알리지 못할 수 있습니다.");
      recommendedStrategies.push("홍보와 마케팅에 투자를 늘리는 것이 좋습니다.");
      break;

    case "토":
      weaknesses.push("돈을 오래 유지하는 힘이 부족할 수 있습니다.");
      risks.push("수입보다 지출이 먼저 늘어날 가능성이 있습니다.");
      avoidActions.push("생활비와 사업 자금을 함께 관리하지 마십시오.");
      break;

    case "금":
      weaknesses.push("계약과 숫자 관리가 약해질 수 있습니다.");
      risks.push("예상보다 실제 수익이 적을 수 있습니다.");
      recommendedStrategies.push("가계부와 현금흐름을 수시로 점검하십시오.");
      break;

    case "수":
      weaknesses.push("현금 흐름이 불안정해질 수 있습니다.");
      risks.push("급한 투자로 자금 압박을 받을 수 있습니다.");
      avoidActions.push("충분한 여유자금 없이 투자하지 마십시오.");
      break;
  }

  const isStrong = summary.includes("강") || summary.includes("신강");

  const currentSituation = isStrong
    ? `${dayMaster}의 기운이 강하게 작용하여 수익을 만들어 내는 힘은 있지만 지출 관리도 함께 중요합니다.`
    : `${dayMaster}의 기운이 안정적으로 작용하므로 공격적인 투자보다 자산을 지키는 전략이 중요합니다.`;

  const timing = isStrong
    ? "지금은 수익 확대보다 현금 흐름을 안정시키면서 기회를 준비하는 시기입니다."
    : "지금은 무리한 투자보다 자산을 축적하기에 적합한 시기입니다.";
    if (weakElement === yongsin) {
        recommendedStrategies.push(`부족한 ${yongsin} 기운을 보완하는 방향으로 돈의 구조를 짜는 것이 좋습니다.`);
      }
    
      if (strongElement === gisin) {
        avoidActions.push(`이미 강한 ${gisin} 기운이 과해지지 않도록 무리한 확장과 감정적 지출은 피하는 것이 좋습니다.`);
      }
  if (isStrong) {
    recommendedStrategies.push("여유 자금을 확보한 뒤 투자 비중을 늘리십시오.");
    avoidActions.push("고수익만 보고 무리하게 투자하지 마십시오.");
  } else {
    recommendedStrategies.push("꾸준한 저축과 장기 투자 중심으로 자산을 키우십시오.");
    avoidActions.push("단기 수익만 노리는 투자는 피하는 것이 좋습니다.");
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