import type { BasicSajuResult } from "../../../types/basic";

export function buildRealEstateSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";

  return [
    `[부동산 심층 상담]
${name}님의 부동산운은 단순히 매수·매도 타이밍보다, 자금 여력과 보유 안정성을 함께 보는 것이 중요합니다.

[실제 상담에서 자주 보이는 사례]
부동산 흐름이 있는 분들도 무리한 대출이나 조급한 계약으로 부담이 커지는 경우가 있습니다.
좋은 물건보다 중요한 것은 감당 가능한 구조입니다.

[실천 전략]
첫째, 대출 한도보다 월 상환 가능 금액을 먼저 보세요.
둘째, 단기 시세차익보다 보유 가능 기간을 계산하세요.
셋째, 계약 전 입지, 수요, 환금성을 반드시 확인하세요.
넷째, 감정적 판단보다 숫자로 검토하는 습관이 필요합니다.`,
  ];
}