import type { BasicSajuResult } from "../../../types/basic";

export function buildTodaySection(basic: BasicSajuResult): string[] {
  const name = basic.name || "사용자";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";
  const dayMaster = basic.dayMaster ?? "일간";

  return [
    `[오늘의 활용법]
${name}님의 오늘 운세는 큰 운명을 단정하는 것이 아니라, ${dayMaster} 일간의 리듬을 하루 단위로 정리하는 기준입니다.
강한 ${strongElement} 기운은 오늘 밀고 나가는 힘이 되지만, 부족한 ${weakElement} 기운은 무리하거나 놓치기 쉬운 부분으로 나타날 수 있습니다.`,

    `[오늘 조심할 점]
중요한 일은 집중이 잘 되는 시간에 먼저 처리하고, 감정적인 판단은 한 박자 늦추는 것이 좋습니다.
말을 빠르게 하거나 약속을 쉽게 잡으면 나중에 부담으로 돌아올 수 있습니다.`,

    `[오늘의 한 가지 실천]
오늘은 많은 일을 벌리는 것보다 하나를 확실히 마무리하는 것이 운을 안정시키는 방법입니다.
작은 돈, 작은 실수, 작은 피로를 가볍게 넘기지 말고 바로 정리하세요.`,
  ];
}
