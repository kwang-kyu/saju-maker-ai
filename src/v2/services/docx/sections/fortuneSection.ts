import type { BasicSajuResult } from "../../../types/basic";

export function buildFortuneSection(basic: BasicSajuResult): string[] {
  const summary = basic.summary ?? "보통";

  return [
    "종합 마무리",
    `현재 전체 운의 흐름은 ${summary} 수준으로 볼 수 있습니다.`,
    "사주는 미래를 단정하는 것이 아니라 방향을 제시하는 도구입니다.",
    "좋은 운은 더욱 키우고 부족한 부분은 미리 준비하는 것이 가장 중요한 전략입니다.",
    "앞으로도 자신의 장점을 살리고 현실적인 선택을 이어간다면 안정적인 흐름을 만들어 갈 수 있습니다.",
  ];
}