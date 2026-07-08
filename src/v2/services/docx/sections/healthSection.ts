import type { BasicSajuResult } from "../../../types/basic";

export function buildHealthSection(basic: BasicSajuResult): string[] {
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";

  return [
    "건강운",
    `건강운은 타고난 체질의 흐름과 생활 리듬을 함께 보는 영역입니다.`,
    `현재 사주에서는 강한 오행은 ${strongElement}, 약한 오행은 ${weakElement}로 나타납니다.`,
    `강한 기운은 활동성과 회복력으로 작용할 수 있지만, 지나치면 몸의 긴장이나 피로 누적으로 이어질 수 있습니다.`,
    `약한 기운은 평소 생활습관에서 보완해야 할 부분입니다. 무리한 생활보다 규칙적인 수면, 식사, 운동 리듬을 잡는 것이 중요합니다.`,
    `건강운은 병을 단정하는 영역이 아니라, 몸이 쉽게 흔들릴 수 있는 방향을 미리 살피고 관리 기준을 세우는 상담 영역입니다.`,
  ];
}