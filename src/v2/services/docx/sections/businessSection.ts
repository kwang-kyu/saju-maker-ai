import type { BasicSajuResult } from "../../../types/basic";

export function buildBusinessSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";

  return [
    `[사업 심층 상담]
${name}님의 사업운은 단순히 사업을 시작할 수 있는지가 아니라, 어떤 방식으로 운영할 때 안정적으로 성장할 수 있는지가 더 중요합니다.

[실제 상담에서 자주 보이는 사례]
사업운이 있다고 해서 무조건 크게 시작하는 것이 좋은 것은 아닙니다.
많은 경우 작은 규모로 검증하고 경험을 쌓은 뒤 확장하는 방식이 더 좋은 결과를 만듭니다.

[실천 전략]
첫째, 고정비보다 현금흐름을 먼저 확보하세요.
둘째, 혼자 결정하기보다 시장의 반응을 먼저 확인하세요.
셋째, 수익보다 지속 가능한 구조를 만드는 데 집중하세요.
넷째, 무리한 확장보다 안정적인 운영을 우선하세요.`,
  ];
}